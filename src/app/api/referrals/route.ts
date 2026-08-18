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
    const refs = await db.referral.findMany({
      where: { userId: session.id },
      orderBy: { createdAt: 'desc' },
    });

    const totalCommissions = refs.reduce((sum, r) => sum + r.commission, 0);
    const confirmedCommissions = refs
      .filter((r) => r.status === 'confirmed' || r.status === 'paid')
      .reduce((sum, r) => sum + r.commission, 0);
    const paidCommissions = refs
      .filter((r) => r.status === 'paid')
      .reduce((sum, r) => sum + r.commission, 0);
    const pendingCommissions = refs
      .filter((r) => r.status === 'pending')
      .reduce((sum, r) => sum + r.commission, 0);

    const serialized = refs.map((r: any) => ({
      ...r,
      createdAt: r.createdAt instanceof Date ? r.createdAt.toISOString() : r.createdAt,
      updatedAt: r.updatedAt instanceof Date ? r.updatedAt.toISOString() : r.updatedAt,
    }));

    return NextResponse.json({
      referrals: serialized,
      stats: {
        totalCommissions: Math.round(totalCommissions * 100) / 100,
        confirmedCommissions: Math.round(confirmedCommissions * 100) / 100,
        paidCommissions: Math.round(paidCommissions * 100) / 100,
        pendingCommissions: Math.round(pendingCommissions * 100) / 100,
        totalReferrals: refs.length,
      },
    });
  } catch (error) {
    console.error('Referrals error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
