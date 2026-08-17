import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// GET /api/admin/users - List all users
export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== 'admin') {
      return NextResponse.json({ error: 'Acceso denegado. Se requiere rol de administrador.' }, { status: 403 });
    }

    const users = await db.user.findMany({
      select: {
        id: true, name: true, username: true, email: true, role: true, licencia: true,
        paymentHash: true, tradingPackage: true, createdAt: true, updatedAt: true,
        _count: { select: { referrals: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error('Admin list error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}

// DELETE /api/admin/users?id=xxx - Delete a user
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

    // Prevent deleting yourself
    if (userId === session.id) {
      return NextResponse.json({ error: 'No puedes eliminar tu propia cuenta.' }, { status: 400 });
    }

    await db.user.delete({ where: { id: userId } });
    return NextResponse.json({ success: true, message: 'Usuario eliminado correctamente.' });
  } catch (error) {
    console.error('Admin delete error:', error);
    return NextResponse.json({ error: 'Error al eliminar usuario.' }, { status: 500 });
  }
}

// PATCH /api/admin/users - Update user role
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

    const validRoles = ['user', 'admin'];
    if (!validRoles.includes(role)) {
      return NextResponse.json({ error: 'Rol inválido.' }, { status: 400 });
    }

    await db.user.update({ where: { id: userId }, data: { role } });
    return NextResponse.json({ success: true, message: `Rol actualizado a ${role}.` });
  } catch (error) {
    console.error('Admin patch error:', error);
    return NextResponse.json({ error: 'Error al actualizar usuario.' }, { status: 500 });
  }
}
