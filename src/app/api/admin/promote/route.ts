import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';

// POST /api/admin/promote - Self-promote first user to admin (only if no admins exist)
export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    // Only allow if no admins exist yet
    const adminCount = await db.user.count({ where: { role: 'admin' } });
    if (adminCount > 0) {
      return NextResponse.json({ error: 'Ya existe un administrador.' }, { status: 403 });
    }

    await db.user.update({ where: { id: session.id }, data: { role: 'admin' } });
    return NextResponse.json({ success: true, message: 'Ahora eres administrador. Recarga la página.' });
  } catch (error) {
    console.error('Promote error:', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
