// Database layer: Prisma + Supabase (PostgreSQL)

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

const SUPABASE_URL = process.env.DATABASE_URL || 'postgresql://postgres.fiyodooqhoiewgthyrmh:GCRM%40999consultor@aws-0-us-east-2.pooler.supabase.com:6543/postgres';

let _prisma: any = null;

async function getPrisma() {
  if (_prisma) return _prisma;
  const { PrismaClient } = await import('@prisma/client');
  _prisma = new PrismaClient({
    datasources: SUPABASE_URL ? { db: { url: SUPABASE_URL } } : undefined,
  });
  return _prisma;
}

export async function getDB() {
  const prisma = await getPrisma();
  return {
    user: {
      findUnique: (args: any) => prisma.user.findUnique(args),
      findFirst:  (args: any) => prisma.user.findFirst(args),
      findMany:  (args: any) => prisma.user.findMany(args),
      create:    (args: any) => prisma.user.create(args),
      update:    (args: any) => prisma.user.update(args),
      delete:    (args: any) => prisma.user.delete(args),
      count:     (args: any) => prisma.user.count(args),
      groupBy:   (args: any) => prisma.user.groupBy(args),
    },
    referral: {
      findMany:  (args: any) => prisma.referral.findMany(args),
      create:    (args: any) => prisma.referral.create(args),
      count:     (args: any) => prisma.referral.count(args),
      aggregate:  (args: any) => prisma.referral.aggregate(args),
    },
  };
}
