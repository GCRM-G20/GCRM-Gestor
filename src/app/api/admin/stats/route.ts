import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const totalUsers = await db.user.count();
    const totalReferrals = await db.referral.count();
    const admins = await db.user.count({ where: { role: 'admin' } });
    const totalCommissions = await db.referral.aggregate({ _sum: { commission: true } });
    const paidCommissions = await db.referral.aggregate({ where: { status: 'paid' }, _sum: { commission: true } });
    const pendingReferrals = await db.referral.count({ where: { status: 'pending' } });
    const confirmedReferrals = await db.referral.count({ where: { status: 'confirmed' } });
    const paidReferrals = await db.referral.count({ where: { status: 'paid' } });

    // Licencia distribution
    const licenciaDist = await db.user.groupBy({
      by: ['licencia'],
      _count: true,
    });

    // Trading package distribution
    const tradingDist = await db.user.groupBy({
      by: ['tradingPackage'],
      _count: true,
    });

    // Recent users (last 7 days)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentUsers = await db.user.count({
      where: { createdAt: { gte: sevenDaysAgo } },
    });

    return NextResponse.json({
      stats: {
        totalUsers,
        totalReferrals,
        admins,
        totalCommissions: totalCommissions._sum.commission || 0,
        paidCommissions: paidCommissions._sum.commission || 0,
        pendingReferrals,
        confirmedReferrals,
        paidReferrals,
        recentUsers,
        licenciaDistribution: licenciaDist,
        tradingDistribution: tradingDist,
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
