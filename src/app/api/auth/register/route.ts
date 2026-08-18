import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { hashPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { name, username, email, password, licencia, paymentHash, tradingPackage, referredById } = await req.json();

    if (!name || !email || !password) {
      return NextResponse.json({ error: 'Nombre, correo y contraseña son requeridos.' }, { status: 400 });
    }

    if (password.length < 6) {
      return NextResponse.json({ error: 'La contraseña debe tener al menos 6 caracteres.' }, { status: 400 });
    }

    const db = await getDB();
    const existing = await db.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json({ error: 'Este correo ya está registrado.' }, { status: 409 });
    }

    const hashed = await hashPassword(password);

    if (referredById) {
      await db.referral.create({
        data: { userId: referredById, referredName: name, referredEmail: email, commission: 0, status: 'pending' },
      });
    }

    const newUser = await db.user.create({
      data: { name, username: username || '', email, password: hashed, licencia: licencia || '', paymentHash: paymentHash || '', tradingPackage: tradingPackage || '' },
    });

    await createSession({ id: newUser.id, name: newUser.name, email: newUser.email, role: newUser.role });

    const demoNames = ['Carlos M.', 'Ana R.', 'Luis P.', 'María G.', 'Diego S.', 'Sofia L.', 'Pedro K.', 'Laura F.'];
    const statuses = ['confirmed', 'confirmed', 'pending', 'confirmed', 'paid', 'pending', 'confirmed', 'pending'];
    const networks = ['BEP 20 (BSC)', 'TRX (TRC 20)', 'SOL (Solana)'];

    for (let i = 0; i < demoNames.length; i++) {
      const depositAmt = Math.floor(Math.random() * 900 + 100);
      await db.referral.create({
        data: {
          userId: newUser.id, referredName: demoNames[i],
          referredEmail: `${demoNames[i].toLowerCase().replace(/[^a-z]/g, '')}@email.com`,
          commission: depositAmt * 0.05, status: statuses[i],
          depositAmount: depositAmt, depositNetwork: networks[i % 3],
          createdAt: new Date(Date.now() - (demoNames.length - i) * 86400000),
        },
      });
    }

    return NextResponse.json({ success: true, user: { id: newUser.id, name: newUser.name, email: newUser.email } });
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
