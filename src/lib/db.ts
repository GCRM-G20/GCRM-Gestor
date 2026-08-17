// Auto-switch: Prisma (local dev) vs MemoryStore (Netlify serverless)

import type { User, Referral } from './store';
import { db as memoryDb } from './store';

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

export async function getDB() {
  // On Netlify serverless, always use in-memory store (Prisma needs writable FS)
  // NETLIFY may not be set, but AWS_LAMBDA_FUNCTION_NAME is always set by Netlify Functions
  const isServerless =
    typeof process.env.NETLIFY !== 'undefined' ||
    typeof process.env.AWS_LAMBDA_FUNCTION_NAME !== 'undefined';

  if (isServerless) {
    return memoryDb;
  }

  // Local dev: use Prisma with SQLite
  try {
    const { PrismaClient } = await import('@prisma/client');
    const globalForPrisma = globalThis as unknown as { prisma: any | undefined };
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
  } catch (err) {
    console.error('Prisma failed, using MemoryStore:', err);
    return memoryDb;
  }
}
