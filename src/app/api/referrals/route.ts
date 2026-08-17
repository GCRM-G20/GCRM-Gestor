import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const referrals = await db.referral.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate stats
    const totalCommissions = referrals.reduce((sum, r) => sum + r.commission, 0);
    const confirmedCommissions = referrals
      .filter((r) => r.status === 'confirmed' || r.status === 'paid')
      .reduce((sum, r) => sum + r.commission, 0);
    const paidCommissions = referrals
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.commission, 0);
    const pendingCommissions = referrals
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.commission, 0);
    const totalReferrals = referrals.length;

    return NextResponse.json({
      referrals,
      stats: {
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        confirmedCommissions: Math.round(confirmedCommissions * 100) / 100,
        paidCommissions: Math.round(paidCommissions * 100) / 100,
        pendingCommissions: Math.round(pendingCommissions * 100) / 100,
        totalReferrals,
      },
    });
  } catch (error) {
    console.error('Referrals error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
