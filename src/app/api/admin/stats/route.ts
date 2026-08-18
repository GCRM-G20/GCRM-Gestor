import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const db = await getDB();
    const allUsers = await db.user.findMany({});
    const allRefs = await db.referral.findMany({});

    const totalUsers = allUsers.length;
    const admins = allUsers.filter(u => u.role === 'admin').length;
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000);
    const recentUsers = allUsers.filter(u => {
      const d = u.createdAt instanceof Date ? u.createdAt : new Date(u.createdAt);
      return d >= sevenDaysAgo;
    }).length;
    const totalReferrals = allRefs.length;
    const totalCommissions = allRefs.reduce((s, r) => s + r.commission, 0);
    const paidCommissions = allRefs.filter(r => r.status === 'paid').reduce((s, r) => s + r.commission, 0);
    const pendingReferrals = allRefs.filter(r => r.status === 'pending').length;
    const confirmedReferrals = allRefs.filter(r => r.status === 'confirmed').length;
    const paidReferrals = allRefs.filter(r => r.status === 'paid').length;

    const licenciaMap: Record<string, number> = {};
    const tradingMap: Record<string, number> = {};
    for (const u of allUsers) {
      const l = u.licencia || '';
      const t = u.tradingPackage || '';
      licenciaMap[l] = (licenciaMap[l] || 0) + 1;
      tradingMap[t] = (tradingMap[t] || 0) + 1;
    }

    return NextResponse.json({
      stats: {
        totalUsers, totalReferrals, admins,
        totalCommissions, paidCommissions,
        pendingReferrals, confirmedReferrals, paidReferrals, recentUsers,
        licenciaDistribution: Object.entries(licenciaMap).map(([licencia, _count]) => ({ licencia, _count })),
        tradingDistribution: Object.entries(tradingMap).map(([tradingPackage, _count]) => ({ tradingPackage, _count })),
      },
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
