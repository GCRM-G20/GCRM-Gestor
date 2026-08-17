import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function PUT(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const { usdtWallet, usdtNetwork } = await req.json();

    if (!usdtWallet || !usdtWallet.trim()) {
      return NextResponse.json({ error: 'La dirección de la billetera es requerida.' }, { status: 400 });
    }

    const validNetworks = ['bep20', 'trx', 'sol'];
    if (!usdtNetwork || !validNetworks.includes(usdtNetwork)) {
      return NextResponse.json({ error: 'Selecciona una red válida.' }, { status: 400 });
    }

    const trimmedWallet = usdtWallet.trim();
    if (usdtNetwork === 'trx' && !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmedWallet)) {
      return NextResponse.json({ error: 'Dirección TRC-20 inválida.' }, { status: 400 });
    }
    if (usdtNetwork === 'bep20' && !/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      return NextResponse.json({ error: 'Dirección BEP-20 inválida.' }, { status: 400 });
    }
    if (usdtNetwork === 'sol' && (trimmedWallet.length < 32 || trimmedWallet.length > 44)) {
      return NextResponse.json({ error: 'Dirección Solana inválida.' }, { status: 400 });
    }

    const db = await getDB();
    await db.user.update({
      where: { id: session.id },
      data: { usdtWallet: trimmedWallet, usdtNetwork },
    });

    return NextResponse.json({
      success: true,
      message: 'Billetera guardada correctamente. Recibirás tus comisiones del 5% en esta dirección.',
      usdtWallet: trimmedWallet,
      usdtNetwork,
    });
  } catch (error) {
    console.error('Wallet update error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

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
      usdtWallet: u.usdtWallet,
      usdtNetwork: u.usdtNetwork,
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
