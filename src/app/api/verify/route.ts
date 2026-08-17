import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { hashPassword, verifyPassword } from '@/lib/auth';

export async function GET() {
  const results: { test: string; pass: boolean; detail: string }[] = [];
  const check = (test: string, pass: boolean, detail: string) => results.push({ test, pass, detail });

  try {
    // 1. DB connection
    try {
      const count = await db.user.count();
      check('DB conectada', true, `${count} usuarios en DB`);
    } catch (e: any) {
      check('DB conectada', false, e.message);
    }

    // 2. Register test user
    const ts = Date.now();
    const testEmail = `verify${ts}@test.com`;
    const testPass = '123456';
    const testHash = await hashPassword(testPass);
    var testUser: any = null;
    try {
      const existing = await db.user.findUnique({ where: { email: testEmail } });
      if (existing) {
        check('Registro (usuario ya existe)', true, `Email ${testEmail} existe, reusando`);
        testUser = existing;
      } else {
        const user = await db.user.create({
          data: { name: `Test Verify ${ts}`, email: testEmail, password: testHash, usdtWallet: '', usdtNetwork: '' },
        });
        for (let i = 0; i < 3; i++) {
          await db.referral.create({
            data: { userId: user.id, referredName: `Ref${i}`, referredEmail: `ref${i}@t.com`, commission: 10 + i * 5, status: ['confirmed','pending','paid'][i], depositAmount: 200 + i * 100, depositNetwork: ['TRX (TRC 20)','BEP 20 (BSC)','SOL (Solana)'][i] },
          });
        }
        testUser = user;
        check('Registro nuevo usuario', true, `Creado: ${user.name}`);
      }
    } catch (e: any) { check('Registro', false, e.message); }

    // 3. Password verify
    if (testUser) {
      const valid = await verifyPassword(testPass, testUser.password);
      check('Verificación contraseña SHA-256', valid, `Resultado: ${valid}`);
    }

    // 4. Save Wallet TRC-20
    if (testUser) {
      try {
        const trxAddr = 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm';
        await db.user.update({ where: { id: testUser.id }, data: { usdtWallet: trxAddr, usdtNetwork: 'trx' } });
        const u = await db.user.findUnique({ where: { id: testUser.id }, select: { usdtWallet: true, usdtNetwork: true } });
        check('Guardar Wallet TRC-20', u?.usdtWallet === trxAddr && u?.usdtNetwork === 'trx', `Wallet: ${u?.usdtWallet?.slice(0,15)}... Red: ${u?.usdtNetwork}`);
      } catch (e: any) { check('Guardar Wallet TRC-20', false, e.message); }
    }

    // 5. Update to BEP-20
    if (testUser) {
      try {
        const bepAddr = '0xB4C692980666A2260F40123D6772Bec2ae464ea2';
        await db.user.update({ where: { id: testUser.id }, data: { usdtWallet: bepAddr, usdtNetwork: 'bep20' } });
        const u = await db.user.findUnique({ where: { id: testUser.id }, select: { usdtWallet: true, usdtNetwork: true } });
        check('Actualizar Wallet BEP-20', u?.usdtNetwork === 'bep20', `Red actualizada: ${u?.usdtNetwork}`);
      } catch (e: any) { check('Actualizar Wallet BEP-20', false, e.message); }
    }

    // 6. Referrals
    if (testUser) {
      try {
        const refs = await db.referral.findMany({ where: { userId: testUser.id } });
        const total = refs.reduce((s, r) => s + r.commission, 0);
        check('Consultar referidos + comisiones', refs.length > 0, `${refs.length} referidos, comisión total: $${total.toFixed(2)}`);
      } catch (e: any) { check('Consultar referidos', false, e.message); }
    }

    // 7. Admin stats
    try {
      const totalUsers = await db.user.count();
      const totalRefs = await db.referral.count();
      const admins = await db.user.count({ where: { role: 'admin' } });
      check('Estadísticas globales', true, `Users: ${totalUsers}, Refs: ${totalRefs}, Admins: ${admins}`);
    } catch (e: any) { check('Estadísticas globales', false, e.message); }

    // 8. Validaciones
    const validTrx = /^T[1-9A-HJ-NP-Za-km-z]{33}$/.test('TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm');
    const invalidTrx = !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test('0x12345');
    check('Validación TRC-20', validTrx && invalidTrx, `Válida OK, Inválida detectada OK`);

    const validBep = /^0x[a-fA-F0-9]{40}$/.test('0xB4C692980666A2260F40123D6772Bec2ae464ea2');
    const invalidBep = !/^0x[a-fA-F0-9]{40}$/.test('short');
    check('Validación BEP-20', validBep && invalidBep, `Válida OK, Inválida detectada OK`);

    const validSol = (a) => a.length >= 32 && a.length <= 44;
    check('Validación SOL', validSol('74rwLcYBkYwADog7QwWa4PcomXUN9TX6da2CU7WYsnjA') && !validSol('x'), `Válida OK, Inválida detectada OK`);

    // 9. Schema fields
    try {
      const u = await db.user.findFirst({ select: { usdtWallet: true, usdtNetwork: true } });
      check('Campos wallet en DB', u !== null && 'usdtWallet' in u, 'usdtWallet y usdtNetwork en modelo User');
    } catch (e: any) { check('Campos wallet en DB', false, e.message); }

  } catch (e: any) { check('Error general', false, e.message); }

  const pass = results.filter(r => r.pass).length;
  const fail = results.filter(r => !r.pass).length;

  return NextResponse.json({
    summary: { total: results.length, passed: pass, failed: fail, status: fail === 0 ? 'ALL PASS ✅' : `ISSUES: ${fail} ❌` },
    results,
  });
}