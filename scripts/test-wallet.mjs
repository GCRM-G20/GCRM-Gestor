import net from 'net';

function rawRequest(host, payload) {
  return new Promise((resolve, reject) => {
    const client = net.createConnection({ port: 3000, host }, () => {
      const data = JSON.stringify(payload.body);
      let req = `${payload.method} ${payload.path} HTTP/1.1\r\nHost: ${host}:3000\r\nContent-Type: application/json\r\nContent-Length: ${data.length}\r\nConnection: close\r\n`;
      if (payload.cookie) req += `Cookie: ${payload.cookie}\r\n`;
      client.write(req + '\r\n' + data);
    });
    let resp = '';
    client.on('data', d => resp += d);
    client.on('end', () => {
      const bodyStart = resp.indexOf('\r\n\r\n');
      const body = bodyStart >= 0 ? resp.slice(bodyStart + 4) : resp;
      const statusLine = resp.split('\r\n')[0];
      resolve({ status: statusLine, body, rawHeaders: resp.slice(0, bodyStart) });
    });
    client.on('error', reject);
  });
}

function extractCookie(rawHeaders) {
  const lines = rawHeaders.split('\r\n');
  for (const l of lines) {
    if (l.toLowerCase().startsWith('set-cookie:')) {
      return l.split(';')[0].replace('set-cookie:', '').trim();
    }
  }
  return null;
}

async function test() {
  const host = '127.0.0.1';
  
  // 1. Register
  console.log('=== REGISTER ===');
  const reg = await rawRequest(host, {
    method: 'POST',
    path: '/api/auth/register',
    body: { name: 'Test Wallet', email: 'wallet@test.com', password: '123456' }
  });
  console.log(reg.status);
  console.log(reg.body);
  const cookie = extractCookie(reg.rawHeaders);
  if (!cookie) { console.log('No cookie - may already exist'); return; }
  console.log('Cookie OK');

  // 2. Save wallet (TRC-20)
  console.log('\n=== SAVE WALLET (TRC-20) ===');
  const save = await rawRequest(host, {
    method: 'PUT',
    path: '/api/user/wallet',
    body: { usdtWallet: 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm', usdtNetwork: 'trx' },
    cookie
  });
  console.log(save.status);
  console.log(save.body);

  // 3. Get wallet
  console.log('\n=== GET WALLET ===');
  const get = await rawRequest(host, {
    method: 'GET',
    path: '/api/user/wallet',
    cookie
  });
  console.log(get.status);
  console.log(get.body);

  // 4. Test invalid address
  console.log('\n=== TEST INVALID WALLET (bad TRC-20) ===');
  const bad = await rawRequest(host, {
    method: 'PUT',
    path: '/api/user/wallet',
    body: { usdtWallet: '0x12345', usdtNetwork: 'trx' },
    cookie
  });
  console.log(bad.status);
  console.log(bad.body);

  // 5. Test valid BEP-20
  console.log('\n=== SAVE WALLET (BEP-20) ===');
  const bep = await rawRequest(host, {
    method: 'PUT',
    path: '/api/user/wallet',
    body: { usdtWallet: '0xB4C692980666A2260F40123D6772Bec2ae464ea2', usdtNetwork: 'bep20' },
    cookie
  });
  console.log(bep.status);
  console.log(bep.body);

  console.log('\n=== ALL TESTS DONE ===');
}

test().catch(e => console.error('FAIL:', e.message));
