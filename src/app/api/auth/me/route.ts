import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const db = await getDB();
    const u = await db.user.findUnique({ where: { id: session.id } });

    if (!u) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      user: {
        id: u.id, name: u.name, email: u.email, role: u.role,
        licencia: u.licencia, username: u.username,
        paymentHash: u.paymentHash, tradingPackage: u.tradingPackage,
        usdtWallet: u.usdtWallet, usdtNetwork: u.usdtNetwork,
        createdAt: u.createdAt,
      },
    });
  } catch (error) {
    console.error('Me error:', error);
    const msg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: 'Error interno del servidor.', debug: msg }, { status: 500 });
  }
}
