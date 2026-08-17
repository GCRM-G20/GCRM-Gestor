import net from 'net';

const HOST = '127.0.0.1';
const PORT = 3000;

function httpReq(method, path, body, cookie) {
  return new Promise((resolve, reject) => {
    const data = body ? JSON.stringify(body) : '';
    let headers = `Host: ${HOST}:${PORT}\r\nContent-Type: application/json\r\nContent-Length: ${Buffer.byteLength(data)}\r\nConnection: close\r\n`;
    if (cookie) headers += `Cookie: ${cookie}\r\n`;
    const reqStr = `${method} ${path} HTTP/1.1\r\n${headers}\r\n${data}`;

    const client = net.createConnection({ port: PORT, host: HOST }, () => client.write(reqStr));
    let resp = '';
    client.on('data', d => resp += d);
    client.on('end', () => {
      const sep = resp.indexOf('\r\n\r\n');
      const rawH = sep >= 0 ? resp.slice(0, sep) : '';
      const body = sep >= 0 ? resp.slice(sep + 4) : resp;
      const statusLine = rawH.split('\r\n')[0];
      let cookie2 = null;
      for (const l of rawH.split('\r\n')) {
        if (l.toLowerCase().startsWith('set-cookie:')) { cookie2 = l.split(';')[0].replace('set-cookie:', '').trim(); break; }
      }
      resolve({ status: statusLine, body, cookie: cookie2 });
    });
    client.on('error', reject);
  });
}

let pass = 0, fail = 0;
function check(label, condition) {
  if (condition) { console.log(`  ✅ ${label}`); pass++; }
  else { console.log(`  ❌ ${label}`); fail++; }
}

async function verify() {
  console.log('=== GCRM Exchange - Verificación End-to-End ===\n');

  // 1. Home page
  console.log('[1] Página principal (GET /)');
  try {
    const home = await httpReq('GET', '/', null);
    check('Status 200', home.status.includes('200'));
    check('Contiene GCRM', home.body.includes('GCRM'));
  } catch(e) { check('Página principal responde', false); }

  // 2. Register
  console.log('\n[2] Registro de usuario (POST /api/auth/register)');
  let cookie;
  try {
    const ts = Date.now();
    const reg = await httpReq('POST', '/api/auth/register', {
      name: `Usuario Verificación ${ts}`,
      email: `verify${ts}@test.com`,
      password: '123456'
    });
    check('Status 200', reg.status.includes('200'));
    const rj = JSON.parse(reg.body);
    check('success: true', rj.success === true);
    check('Nombre correcto', rj.user?.name?.includes('Verificación'));
    cookie = reg.cookie;
    check('Cookie de sesión generada', !!cookie);
  } catch(e) { check('Registro responde', false); }

  if (!cookie) { console.log('\n⚠️  No se pudo obtener sesión. Abortando.'); return; }

  // 3. Session /me
  console.log('\n[3] Sesión activa (GET /api/auth/me)');
  try {
    const me = await httpReq('GET', '/api/auth/me', null, cookie);
    check('Status 200', me.status.includes('200'));
    const mj = JSON.parse(me.body);
    check('Usuario tiene id', !!mj.user?.id);
    check('Usuario tiene email', !!mj.user?.email);
    check('Campo usdtWallet existe', 'usdtWallet' in mj.user);
    check('Campo usdtNetwork existe', 'usdtNetwork' in mj.user);
  } catch(e) { check('Session/me responde', false); }

  // 4. Save Wallet TRC-20
  console.log('\n[4] Guardar billetera TRC-20 (PUT /api/user/wallet)');
  try {
    const saveTrx = await httpReq('PUT', '/api/user/wallet', {
      usdtWallet: 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm',
      usdtNetwork: 'trx'
    }, cookie);
    check('Status 200', saveTrx.status.includes('200'));
    const sj = JSON.parse(saveTrx.body);
    check('success: true', sj.success === true);
    check('Wallet guardada', sj.usdtWallet === 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm');
    check('Red trx', sj.usdtNetwork === 'trx');
  } catch(e) { check('Save wallet TRX responde', false); }

  // 5. Get Wallet
  console.log('\n[5] Obtener billetera guardada (GET /api/user/wallet)');
  try {
    const getW = await httpReq('GET', '/api/user/wallet', null, cookie);
    check('Status 200', getW.status.includes('200'));
    const gj = JSON.parse(getW.body);
    check('Wallet coincide', gj.usdtWallet === 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm');
    check('Red coincide', gj.usdtNetwork === 'trx');
  } catch(e) { check('Get wallet responde', false); }

  // 6. Validación - dirección inválida TRC-20
  console.log('\n[6] Validación: dirección TRC-20 inválida');
  try {
    const badTrx = await httpReq('PUT', '/api/user/wallet', {
      usdtWallet: '0x12345invalid',
      usdtNetwork: 'trx'
    }, cookie);
    check('Status 400', badTrx.status.includes('400'));
    const bj = JSON.parse(badTrx.body);
    check('Error de validación', !!bj.error);
  } catch(e) { check('Validación TRX funciona', false); }

  // 7. Validación - dirección inválida BEP-20
  console.log('\n[7] Validación: dirección BEP-20 inválida');
  try {
    const badBep = await httpReq('PUT', '/api/user/wallet', {
      usdtWallet: 'TXshort',
      usdtNetwork: 'bep20'
    }, cookie);
    check('Status 400', badBep.status.includes('400'));
  } catch(e) { check('Validación BEP funciona', false); }

  // 8. Guardar BEP-20 válida
  console.log('\n[8] Guardar billetera BEP-20 válida');
  try {
    const saveBep = await httpReq('PUT', '/api/user/wallet', {
      usdtWallet: '0xB4C692980666A2260F40123D6772Bec2ae464ea2',
      usdtNetwork: 'bep20'
    }, cookie);
    check('Status 200', saveBep.status.includes('200'));
    const bbj = JSON.parse(saveBep.body);
    check('Wallet BEP guardada', bbj.usdtNetwork === 'bep20');
  } catch(e) { check('Save BEP responde', false); }

  // 9. Referrals
  console.log('\n[9] Referidos y comisiones (GET /api/referrals)');
  try {
    const ref = await httpReq('GET', '/api/referrals', null, cookie);
    check('Status 200', ref.status.includes('200'));
    const rj = JSON.parse(ref.body);
    check('Array de referidos', Array.isArray(rj.referrals));
    check('Stats presentes', !!rj.stats);
    check('totalCommissions es número', typeof rj.stats?.totalCommissions === 'number');
    console.log(`  ℹ️  Referidos: ${rj.referrals.length}, Comisión total: $${rj.stats?.totalCommissions?.toFixed(2)}`);
  } catch(e) { check('Referrals responde', false); }

  // 10. Login
  console.log('\n[10] Login (POST /api/auth/login)');
  try {
    const login = await httpReq('POST', '/api/auth/login', { email: 'verify@test.com', password: 'wrong' });
    check('Credenciales inválidas -> 401', login.status.includes('401'));
  } catch(e) { check('Login validation funciona', false); }

  // 11. Wallet sin auth
  console.log('\n[11] Wallet sin autenticación');
  try {
    const noAuth = await httpReq('PUT', '/api/user/wallet', { usdtWallet: 'test', usdtNetwork: 'trx' });
    check('Status 401', noAuth.status.includes('401'));
  } catch(e) { check('Auth required funciona', false); }

  // Summary
  console.log(`\n${'═'.repeat(45)}`);
  console.log(`  RESULTADO: ${pass} ✅  |  ${fail} ❌  |  ${pass+fail} total`);
  console.log(`${'═'.repeat(45)}`);
  if (fail === 0) console.log('  🎉 Todo funciona correctamente!');
  else console.log('  ⚠️  Hay errores que revisar.');
}

verify().catch(e => console.error('FATAL:', e.message));
