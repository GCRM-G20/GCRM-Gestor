import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { getDB } from '@/lib/db';

export async function POST() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: 'No autenticado.' }, { status: 401 });
    }

    const db = await getDB();
    const admins = await db.user.count({ where: { role: 'admin' } });
    if (admins > 0) {
      return NextResponse.json({ error: 'Ya existe un administrador.' }, { status: 403 });
    }

    await db.user.update({ where: { id: session.id }, data: { role: 'admin' } });
    return NextResponse.json({ success: true, message: 'Ahora eres administrador. Recarga la página.' });
  } catch (error) {
    console.error('Promote error:', error);
    return NextResponse.json({ error: 'Error interno.' }, { status: 500 });
  }
}
