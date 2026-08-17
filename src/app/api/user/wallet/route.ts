import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// PUT /api/user/wallet - Save or update USDT wallet for commission payouts
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
      return NextResponse.json({ error: 'Selecciona una red válida (BEP-20, TRC-20 o SOL).' }, { status: 400 });
    }

    // Basic address validation per network
    const trimmedWallet = usdtWallet.trim();
    if (usdtNetwork === 'trx' && !/^T[1-9A-HJ-NP-Za-km-z]{33}$/.test(trimmedWallet)) {
      return NextResponse.json({ error: 'Dirección TRC-20 inválida. Debe comenzar con T y tener 34 caracteres.' }, { status: 400 });
    }
    if (usdtNetwork === 'bep20' && !/^0x[a-fA-F0-9]{40}$/.test(trimmedWallet)) {
      return NextResponse.json({ error: 'Dirección BEP-20 inválida. Debe comenzar con 0x y tener 42 caracteres.' }, { status: 400 });
    }
    if (usdtNetwork === 'sol' && (trimmedWallet.length < 32 || trimmedWallet.length > 44)) {
      return NextResponse.json({ error: 'Dirección Solana inválida. Debe tener entre 32 y 44 caracteres.' }, { status: 400 });
    }

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

// GET /api/user/wallet - Retrieve current wallet info
export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const user = await db.user.findUnique({
      where: { id: session.id },
      select: { usdtWallet: true, usdtNetwork: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'Usuario no encontrado.' }, { status: 404 });
    }

    return NextResponse.json({
      usdtWallet: user.usdtWallet,
      usdtNetwork: user.usdtNetwork,
    });
  } catch (error) {
    console.error('Wallet fetch error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
