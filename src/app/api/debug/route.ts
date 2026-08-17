import { NextResponse } from 'next/server';

export async function GET() {
  const info: Record<string, string> = {};
  info.NODE_ENV = process.env.NODE_ENV || 'not set';
  info.NETLIFY = process.env.NETLIFY || 'not set';
  info.NETLIFY_NEXT_PLUGIN_SKIP = process.env.NETLIFY_NEXT_PLUGIN_SKIP || 'not set';
  info.AWS_LAMBDA_FUNCTION_NAME = process.env.AWS_LAMBDA_FUNCTION_NAME || 'not set';

  // Try loading store
  try {
    const mod = await import('@/lib/store');
    info.storeLoaded = 'yes';
    info.storeUsers = String(mod.db.user ? 'has user methods' : 'missing user');
  } catch (err: any) {
    info.storeLoaded = 'error: ' + (err?.message || String(err));
  }

  // Try loading db
  try {
    const { getDB } = await import('@/lib/db');
    const db = await getDB();
    info.dbLoaded = 'yes';
    info.dbHasUser = String(!!db.user);
  } catch (err: any) {
    info.dbLoaded = 'error: ' + (err?.message || String(err));
  }

  // Try crypto
  try {
    const encoder = new TextEncoder();
    const data = encoder.encode('test');
    const hash = await crypto.subtle.digest('SHA-256', data);
    info.crypto = 'works';
  } catch (err: any) {
    info.crypto = 'error: ' + (err?.message || String(err));
  }

  // Try cookies
  try {
    const { cookies } = await import('next/headers');
    const cookie = await cookies();
    info.cookies = 'works';
  } catch (err: any) {
    info.cookies = 'error: ' + (err?.message || String(err));
  }

  return NextResponse.json(info);
}
