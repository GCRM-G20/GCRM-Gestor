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

const IS_SERVERLESS = typeof process.env.NETLIFY !== 'undefined';

export async function getDB() {
  if (IS_SERVERLESS) {
    const mod = await import('./store');
    return mod.db;
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
