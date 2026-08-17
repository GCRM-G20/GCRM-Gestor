// In-memory data store for serverless environments (Netlify, Vercel Edge, etc.)
// Drop-in replacement for Prisma with the same query interface

export type User = {
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
};

export type Referral = {
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
};

// Global singleton — persists across warm invocations in Netlify
const globalStore = globalThis as unknown as { _gcrmStore: MemoryStore | undefined };

class MemoryStore {
  users: Map<string, User> = new Map();
  referrals: Map<string, Referral> = new Map();

  constructor() {
    this._seedIfEmpty();
  }

  _seedIfEmpty() {
    if (this.users.size > 0) return;
    // Pre-create admin so promote isn't needed on fresh deploy
    const adminId = this._cuid();
    const now = new Date().toISOString();
    const admin: User = {
      id: adminId, name: 'GCRM Admin', username: 'admin', email: 'admin@gcrm.com',
      password: '', role: 'admin', licencia: 'supervisor', paymentHash: '',
      tradingPackage: '16000 GCRM', usdtWallet: '', usdtNetwork: '',
      createdAt: now, updatedAt: now,
    };
    this.users.set(adminId, admin);
  }

  _cuid(): string {
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    const ts = Date.now().toString(36);
    let rand = '';
    for (let i = 0; i < 15; i++) rand += chars[Math.floor(Math.random() * chars.length)];
    return ts + rand;
  }

  _now() { return new Date().toISOString(); }
}

function getStore(): MemoryStore {
  if (!globalStore._gcrmStore) globalStore._gcrmStore = new MemoryStore();
  return globalStore._gcrmStore;
}

// ─── User operations ───

export const db = {
  user: {
    findUnique: async ({ where }: { where: { id?: string; email?: string } }) => {
      const store = getStore();
      if (where.id) return store.users.get(where.id) ?? null;
      if (where.email) {
        for (const u of store.users.values()) {
          if (u.email === where.email) return u;
        }
      }
      return null;
    },

    findFirst: async ({ where, select }: { where?: any; select?: any }) => {
      const store = getStore();
      for (const u of store.users.values()) {
        let match = true;
        if (where?.role && u.role !== where.role) match = false;
        if (match) return select ? pick(u, Object.keys(select)) : u;
      }
      return null;
    },

    findMany: async ({ select, orderBy, where }: { select?: any; orderBy?: any; where?: any } = {}) => {
      const store = getStore();
      let users = Array.from(store.users.values());
      if (where?.role) users = users.filter(u => u.role === where.role);
      if (orderBy?.createdAt === 'desc') users.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      if (select) return users.map(u => pick(u, Object.keys(select)));
      return users;
    },

    create: async ({ data }: { data: any }) => {
      const store = getStore();
      const now = store._now();
      const user: User = {
        id: data.id || store._cuid(),
        name: data.name, username: data.username || '', email: data.email,
        password: data.password, role: data.role || 'user',
        licencia: data.licencia || '', paymentHash: data.paymentHash || '',
        tradingPackage: data.tradingPackage || '',
        usdtWallet: data.usdtWallet || '', usdtNetwork: data.usdtNetwork || '',
        createdAt: data.createdAt || now, updatedAt: now,
      };
      store.users.set(user.id, user);
      return user;
    },

    update: async ({ where, data }: { where: { id: string }; data: any }) => {
      const store = getStore();
      const user = store.users.get(where.id);
      if (!user) throw new Error('User not found');
      const updated = { ...user, ...data, updatedAt: store._now() };
      store.users.set(where.id, updated);
      return updated;
    },

    delete: async ({ where }: { where: { id: string } }) => {
      const store = getStore();
      const deleted = store.users.get(where.id);
      if (!deleted) throw new Error('User not found');
      store.users.delete(where.id);
      // Cascade delete referrals
      for (const [rid, ref] of store.referrals) {
        if (ref.userId === where.id) store.referrals.delete(rid);
      }
      return deleted;
    },

    count: async ({ where }: { where?: any } = {}) => {
      const store = getStore();
      let users = Array.from(store.users.values());
      if (where?.role) users = users.filter(u => u.role === where.role);
      if (where?.createdAt?.gte) users = users.filter(u => new Date(u.createdAt) >= where.createdAt.gte);
      return users.length;
    },

    groupBy: async ({ by }: { by: string[] }) => {
      const store = getStore();
      const groups: Record<string, { [key: string]: string; _count: number }> = {};
      const field = by[0];
      for (const u of store.users.values()) {
        const key = (u as any)[field] || '';
        if (!groups[key]) groups[key] = { [field]: key, _count: 0 } as any;
        groups[key]._count++;
      }
      return Object.values(groups);
    },
  },

  referral: {
    findMany: async ({ where, orderBy }: { where?: any; orderBy?: any } = {}) => {
      const store = getStore();
      let refs = Array.from(store.referrals.values());
      if (where?.userId) refs = refs.filter(r => r.userId === where.userId);
      if (where?.status) refs = refs.filter(r => r.status === where.status);
      if (orderBy?.createdAt === 'desc') refs.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
      return refs;
    },

    create: async ({ data }: { data: any }) => {
      const store = getStore();
      const now = store._now();
      const ref: Referral = {
        id: data.id || store._cuid(),
        userId: data.userId, referredName: data.referredName,
        referredEmail: data.referredEmail, commission: data.commission || 0,
        status: data.status || 'pending', depositAmount: data.depositAmount ?? null,
        depositNetwork: data.depositNetwork ?? null,
        createdAt: data.createdAt || now, updatedAt: now,
      };
      store.referrals.set(ref.id, ref);
      return ref;
    },

    count: async ({ where }: { where?: any } = {}) => {
      const store = getStore();
      let refs = Array.from(store.referrals.values());
      if (where?.userId) refs = refs.filter(r => r.userId === where.userId);
      if (where?.status) refs = refs.filter(r => r.status === where.status);
      return refs.length;
    },

    aggregate: async ({ where, _sum }: { where?: any; _sum: { commission: boolean } }) => {
      const store = getStore();
      let refs = Array.from(store.referrals.values());
      if (where?.status) refs = refs.filter(r => r.status === where.status);
      const total = refs.reduce((s, r) => s + r.commission, 0);
      return { _sum: { commission: total } };
    },
  },
};

function pick<T extends Record<string, any>>(obj: T, keys: string[]): Partial<T> {
  const result: any = {};
  for (const k of keys) if (k in obj) result[k] = (obj as any)[k];
  return result;
}
