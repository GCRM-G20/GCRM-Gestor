import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const db = await getDB();
    const users = await db.user.findMany({ orderBy: { createdAt: 'desc' } });

    const allRefs = await db.referral.findMany({});
    const refCounts: Record<string, number> = {};
    for (const r of allRefs) {
      refCounts[r.userId] = (refCounts[r.userId] || 0) + 1;
    }

    const enriched = users.map((u: any) => ({
      id: u.id,
      name: u.name,
      username: u.username,
      email: u.email,
      role: u.role,
      licencia: u.licencia,
      tradingPackage: u.tradingPackage,
      usdtWallet: u.usdtWallet,
      usdtNetwork: u.usdtNetwork,
      createdAt: u.createdAt instanceof Date ? u.createdAt.toISOString() : u.createdAt,
      updatedAt: u.updatedAt instanceof Date ? u.updatedAt.toISOString() : u.updatedAt,
      _count: { referrals: refCounts[u.id] || 0 },
    }));

    return NextResponse.json({ users: enriched });
  } catch (error) {
    console.error('Admin list error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const { searchParams } = new URL(req.url);
    const userId = searchParams.get('id');
    if (!userId) {
      return NextResponse.json({ error: 'ID de usuario requerido.' }, { status: 400 });
    }

    if (userId === session.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    const db = await getDB();
    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario.' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado.' }, { status: 403 });
    }

    const { userId, role } = await req.json();
    if (!userId || !role) {
      return NextResponse.json({ error: 'userId y role son requeridos.' }, { status: 400 });
    }

    if (!['user', 'admin'].includes(role)) {
      return NextResponse.json({ error: 'Rol inválido.' }, { status: 400 });
    }

    const db = await getDB();
    await db.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ success: true, message: `Rol actualizado a ${role}.` });
  } catch (error) {
    console.error('Admin patch error:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario.' }, { status: 500 });
  }
}
