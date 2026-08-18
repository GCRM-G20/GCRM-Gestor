import { NextRequest, NextResponse } from 'next/server';
import { getDB } from '@/lib/db';
import { verifyPassword, createSession } from '@/lib/auth';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (!email || !password) {
      return NextResponse.json({ error: 'Correo y contraseña son requeridos.' }, { status: 400 });
    }

    const db = await getDB();
    const u = await db.user.findUnique({ where: { email } });
    if (!u) {
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    const valid = await verifyPassword(password, u.password);
    if (!valid) {
      return NextResponse.json({ error: 'Credenciales inválidas.' }, { status: 401 });
    }

    await createSession({ id: u.id, name: u.name, email: u.email, role: u.role });

    return NextResponse.json({ success: true, user: { id: u.id, name: u.name, email: u.email } });
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({ error: 'Error interno del servidor.' }, { status: 500 });
  }
}
