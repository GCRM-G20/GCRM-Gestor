// Auto-switch: Prisma (local dev) vs MemoryStore (Netlify serverless)

import type { User, Referral } from './store';

export interface DBUser {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: string;
  licencia: string;
  paymentHash: string;
  tradingPackage: string;
  usdtWallet: string;
  usdtNetwork: string;
  createdAt: string;
  updatedAt: string;
  referrals?: any[];
  _count?: { referrals: number };
}

export interface DBReferral {
  id: string;
  userId: string;
  referredName: string;
  referredEmail: string;
  commission: number;
  status: string;
  depositAmount: number | null;
  depositNetwork: string | null;
  createdAt: string;
  updatedAt: string;
}

// Detect serverless: NETLIFY, VERCEL, AWS_LAMBDA, or any read-only filesystem
const IS_SERVERLESS =
  typeof process.env.NETLIFY !== 'undefined' ||
  typeof process.env.NETLIFY_NEXT_PLUGIN_SKIP !== 'undefined' ||
  typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined' ||
  process.env.NODE_ENV === 'production';

export async function getDB() {
  if (IS_SERVERLESS) {
    try {
      const mod = await import('./store');
      return mod.db;
    } catch (err) {
      console.error('Failed to load MemoryStore:', err);
      // Fallback: try Prisma as last resort
    }
  }

  const { PrismaClient } = await import('@prisma/client');

  const globalForPrisma = globalThis as unknown as {
    prisma: any | undefined
  };

  const prisma = globalForPrisma.prisma ?? new PrismaClient();
  if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

  return {
    user: {
      findUnique: (args: any) => prisma.user.findUnique(args),
      findFirst: (args: any) => prisma.user.findFirst(args),
      findMany: (args: any) => prisma.user.findMany(args),
      create: (args: any) => prisma.user.create(args),
      update: (args: any) => prisma.user.update(args),
      delete: (args: any) => prisma.user.delete(args),
      count: (args: any) => prisma.user.count(args),
      groupBy: (args: any) => prisma.user.groupBy(args),
    },
    referral: {
      findMany: (args: any) => prisma.referral.findMany(args),
      create: (args: any) => prisma.referral.create(args),
      count: (args: any) => prisma.referral.count(args),
      aggregate: (args: any) => prisma.referral.aggregate(args),
    },
  };
}
