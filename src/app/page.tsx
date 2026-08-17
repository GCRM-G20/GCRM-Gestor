'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Copy, Check, ChevronLeft, ChevronRight, ExternalLink, Shield, Zap, Gift,
  ArrowRight, Wallet, Globe, Users, TrendingUp, LogOut, LogIn, User,
  DollarSign, Clock, CheckCircle, AlertCircle, LayoutDashboard,
  Eye, EyeOff, Loader2, BarChart3, UserPlus, Plane, Crown, Star, Award, Hash,
  ShieldCheck, Trash2, UsersRound, ArrowUpDown,
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';

/* ─── TYPES ─── */

interface SessionUser {
  id: string;
  name: string;
  email: string;
  role: string;
  licencia?: string;
}

const LICENCIAS = [
  { id: 'asociado', label: 'Asociado', price: '$150', value: 150 },
  { id: 'promotor', label: 'Promotor', price: '$300', value: 300 },
  { id: 'coordinador', label: 'Coordinador', price: '$500', value: 500 },
  { id: 'supervisor', label: 'Supervisor', price: '$1,000', value: 1000 },
];

const LICENCIA_ICONS: Record<string, typeof Crown> = {
  asociado: Star,
  promotor: Award,
  coordinador: Crown,
  supervisor: Crown,
};

interface Referral {
  id: string;
  referredName: string;
  referredEmail: string;
  commission: number;
  status: string;
  depositAmount: number | null;
  depositNetwork: string | null;
  createdAt: string;
}

interface ReferralStats {
  totalCommissions: number;
  confirmedCommissions: number;
  paidCommissions: number;
  pendingCommissions: number;
  totalReferrals: number;
}

/* ─── DATA ─── */

const USDT_NETWORKS = [
  { id: 'bep20', label: 'BEP 20 (BSC)', address: '0xB4C692980666A2260F40123D6772Bec2ae464ea2', icon: '🔷' },
  { id: 'trx', label: 'TRX (TRC 20)', address: 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm', icon: '🗳' },
  { id: 'sol', label: 'SOL (Solana)', address: '74rwLcYBkYwADog7QwWa4PcomXUN9TX6da2CU7WYsnjA', icon: '🟣' },
];

const EXCHANGES = [
  { name: 'BINGX', color: '#1E90FF', initial: 'B' },
  { name: 'MEXC', color: '#2EB6EA', initial: 'M' },
  { name: 'KUCOIN', color: '#23AF91', initial: 'K' },
  { name: 'Bibyt', color: '#8B5CF6', initial: 'Bi' },
  { name: 'GCRM Exchange', color: '#F0B90B', initial: 'G' },
  { name: 'Coinbase', color: '#0052FF', initial: 'C' },
  { name: 'Binance', color: '#F0B90B', initial: 'B' },
];

const TRADING_GCRM_OPTIONS = [
  { id: '2000', label: '2000 GCRM' },
  { id: '4000', label: '4000 GCRM' },
  { id: '8000', label: '8000 GCRM' },
  { id: '16000', label: '16000 GCRM' },
];

const FEATURES = [
  { icon: Shield, title: 'Seguridad Total', desc: 'Tecnología de seguridad de nivel bancario con encriptación de 256 bits y autenticación multi-factor.' },
  { icon: Zap, title: 'Transacciones Rápidas', desc: 'Procesamiento de depósitos en tiempo real con confirmación en la red blockchain.' },
  { icon: Gift, title: 'Comisión 5%', desc: 'Gana una comisión del 5% por cada registro referido. Programa de referidos ilimitado.' },
  { icon: TrendingUp, title: 'Listado Global', desc: 'GCRM está listado en los principales exchanges del mundo: Binance, Coinbase, MEXC y más.' },
];

/* ─── COMPONENTS ─── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({ title: 'Dirección copiada', description: 'La dirección ha sido copiada al portapapeles.' });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: 'Error al copiar', description: 'No se pudo copiar la dirección.', variant: 'destructive' });
    }
  };

  return (
    <button onClick={handleCopy} className="shrink-0 p-2 rounded-lg bg-[#2B3139] hover:bg-[#3B434D] transition-colors" aria-label="Copiar dirección">
      {copied ? <Check className="w-4 h-4 text-[#0ECB81]" /> : <Copy className="w-4 h-4 text-[#848E9C]" />}
    </button>
  );
}

function ExchangeLogo({ name, color, initial }: { name: string; color: string; initial: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg"
        style={{ background: `linear-gradient(135deg, ${color}22, ${color}44)`, border: `1px solid ${color}55`, color }}
      >
        {initial}
      </div>
      <span className="text-[#848E9C] text-xs md:text-sm font-medium">{name}</span>
    </div>
  );
}

/* ─── PARTICLE BACKGROUND ─── */

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener('resize', resize);

    const PARTICLE_COUNT = 80;
    const CONNECTION_DIST = 150;
    const particles: { x: number; y: number; vx: number; vy: number; r: number; o: number }[] = [];

    for (let i = 0; i < PARTICLE_COUNT; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        r: Math.random() * 1.5 + 0.5,
        o: Math.random() * 0.5 + 0.2,
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Update & draw particles
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0 || p.x > canvas.width) p.vx *= -1;
        if (p.y < 0 || p.y > canvas.height) p.vy *= -1;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(240, 185, 11, ${p.o})`;
        ctx.fill();
      }

      // Draw connections
      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < CONNECTION_DIST) {
            const alpha = (1 - dist / CONNECTION_DIST) * 0.15;
            ctx.beginPath();
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.strokeStyle = `rgba(240, 185, 11, ${alpha})`;
            ctx.lineWidth = 0.5;
            ctx.stroke();
          }
        }
      }

      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener('resize', resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ─── EXCHANGE CAROUSEL ─── */

function ExchangeCarousel() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  const checkScroll = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  }, []);

  useEffect(() => {
    checkScroll();
    const el = scrollRef.current;
    if (el) el.addEventListener('scroll', checkScroll);
    return () => { if (el) el.removeEventListener('scroll', checkScroll); };
  }, [checkScroll]);

  const scroll = (dir: 'left' | 'right') => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir === 'left' ? -200 : 200, behavior: 'smooth' });
  };

  const items = [...EXCHANGES, ...EXCHANGES];

  return (
    <div className="relative w-full">
      <div className="text-center mb-6">
        <p className="text-[#848E9C] text-sm uppercase tracking-widest mb-1">Listado en Exchanges</p>
        <h2 className="text-xl md:text-2xl font-bold text-[#EAECEF]">
          <span className="text-gold-gradient">GCRM EN PRE LANZAMIENTO</span> EN LOS EXCHANGES
        </h2>
        <p className="text-[#848E9C] text-sm mt-2 max-w-xl mx-auto">
          GCRM avanza hacia los principales exchanges del mundo, acercando la nueva era de las finanzas descentralizadas.
        </p>
        <p className="text-[#F0B90B] text-sm font-semibold mt-2">Próximamente: GCRM Exchange + GCRM Wallet.</p>
      </div>
      <div className="relative group">
        {canScrollLeft && (
          <button onClick={() => scroll('left')} className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E2329] border border-[#2B3139] flex items-center justify-center hover:bg-[#2B3139] transition-all opacity-0 group-hover:opacity-100" aria-label="Anterior">
            <ChevronLeft className="w-5 h-5 text-[#EAECEF]" />
          </button>
        )}
        {canScrollRight && (
          <button onClick={() => scroll('right')} className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E2329] border border-[#2B3139] flex items-center justify-center hover:bg-[#2B3139] transition-all opacity-0 group-hover:opacity-100" aria-label="Siguiente">
            <ChevronRight className="w-5 h-5 text-[#EAECEF]" />
          </button>
        )}
        <div ref={scrollRef} className="flex gap-6 overflow-x-auto py-4 px-2 snap-x snap-mandatory" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          {items.map((ex, i) => (
            <div key={`${ex.name}-${i}`} className="snap-center shrink-0">
              <ExchangeLogo {...ex} />
            </div>
          ))}
        </div>
      </div>
      <div className="flex items-center justify-center gap-2 mt-4">
        <div className="h-px bg-[#2B3139] w-16" />
        <span className="text-[#848E9C] text-xs uppercase tracking-wider">Verificado en CoinMarketCap</span>
        <div className="h-px bg-[#2B3139] w-16" />
      </div>
    </div>
  );
}

/* ─── HOTCOIN SECTION ─── */

function HotcoinSection() {
  return (
    <div className="glass-card rounded-2xl p-6 md:p-8">
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E90FF] to-[#0066CC] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
        </div>
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-[#EAECEF] mb-2">
            GCRM en <span className="text-[#1E90FF]">Hotcoin</span>
          </h3>
          <p className="text-[#848E9C] text-sm md:text-base leading-relaxed">
            GCRM token ya está disponible para trading en Hotcoin Exchange. Realiza tus operaciones de compra y venta
            de manera segura en una de las plataformas más confiables del mercado cripto.
          </p>
        </div>
        <a href="https://www.hotcoin.com" target="_blank" rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E90FF] hover:bg-[#1A7AE6] text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#1E90FF]/20">
          Operar Ahora
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>
      <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'Par de Trading', value: 'GCRM/USDT' },
          { label: 'Red', value: 'USDT (TRC-20)' },
          { label: 'Estado', value: 'Activo' },
          { label: 'Volumen 24h', value: '+125K USDT' },
        ].map((item) => (
          <div key={item.label} className="bg-[#0B0E11] rounded-xl p-4 text-center">
            <p className="text-[#848E9C] text-xs mb-1">{item.label}</p>
            <p className="text-[#EAECEF] font-semibold text-sm">{item.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── LOGIN DIALOG ─── */

function LoginDialog({ open, onOpenChange, onSwitchToRegister }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToRegister: () => void;
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast({ title: 'Campos requeridos', description: 'Ingresa correo y contraseña.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Bienvenido', description: `Hola, ${data.user.name}.` });
        onOpenChange(false);
        setEmail(''); setPassword('');
        window.location.reload();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo conectar al servidor.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E2329] border-[#2B3139] text-[#EAECEF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <LogIn className="w-5 h-5 text-[#F0B90B]" />
            Iniciar Sesión
          </DialogTitle>
          <DialogDescription className="text-[#848E9C]">
            Ingresa tus credenciales para acceder a tu panel de comisiones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleLogin} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="login-email" className="text-sm text-[#EAECEF]">Correo Electrónico</Label>
            <Input id="login-email" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-11 text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="login-pass" className="text-sm text-[#EAECEF]">Contraseña</Label>
            <div className="relative">
              <Input id="login-pass" type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-11 text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-[#EAECEF] transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl h-11 text-sm transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Iniciar Sesión'}
          </Button>
          <p className="text-center text-sm text-[#848E9C]">
            ¿No tienes cuenta?{' '}
            <button type="button" onClick={() => { onOpenChange(false); onSwitchToRegister(); }} className="text-[#F0B90B] hover:underline font-medium">
              Regístrate aquí
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── REGISTER DIALOG ─── */

function RegisterDialog({ open, onOpenChange, onSwitchToLogin }: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSwitchToLogin: () => void;
}) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [regLicencia, setRegLicencia] = useState('');
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast({ title: 'Campos requeridos', description: 'Completa todos los campos.', variant: 'destructive' });
      return;
    }
    if (password.length < 6) {
      toast({ title: 'Contraseña corta', description: 'Mínimo 6 caracteres.', variant: 'destructive' });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      toast({ title: 'Correo inválido', description: 'Ingresa un correo válido.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    try {
      const res = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password, licencia: regLicencia }),
      });
      const data = await res.json();
      if (!res.ok) {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      } else {
        toast({ title: 'Registro exitoso', description: `Bienvenido/a ${data.user.name}. Licencia: ${regLicencia ? LICENCIAS.find(l => l.id === regLicencia)?.label : 'N/A'}.` });
        onOpenChange(false);
        setName(''); setEmail(''); setPassword('');
        window.location.reload();
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo conectar al servidor.', variant: 'destructive' });
    }
    setLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-[#1E2329] border-[#2B3139] text-[#EAECEF] sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-[#F0B90B]" />
            Crear Cuenta
          </DialogTitle>
          <DialogDescription className="text-[#848E9C]">
            Regístrate como Miembro Ejecutivo GCRM y accede a tu panel de comisiones.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleRegister} className="space-y-4 mt-4">
          <div className="space-y-2">
            <Label htmlFor="reg-name" className="text-sm text-[#EAECEF]">Nombre Completo</Label>
            <Input id="reg-name" type="text" placeholder="Tu nombre" value={name} onChange={(e) => setName(e.target.value)}
              className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-11 text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-email" className="text-sm text-[#EAECEF]">Correo Electrónico</Label>
            <Input id="reg-email" type="email" placeholder="tu@correo.com" value={email} onChange={(e) => setEmail(e.target.value)}
              className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-11 text-sm" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="reg-pass" className="text-sm text-[#EAECEF]">Contraseña (mínimo 6 caracteres)</Label>
            <div className="relative">
              <Input id="reg-pass" type={showPassword ? 'text' : 'password'} placeholder="Tu contraseña" value={password} onChange={(e) => setPassword(e.target.value)}
                className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-11 text-sm pr-10" />
              <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-[#EAECEF] transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>
          {/* Licencia dropdown */}
          <div className="space-y-2">
            <Label className="text-sm text-[#EAECEF] flex items-center gap-2">
              <Crown className="w-4 h-4 text-[#F0B90B]" />
              Licencia Ejecutiva
            </Label>
            <Select value={regLicencia} onValueChange={setRegLicencia}>
              <SelectTrigger className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] rounded-xl h-11 text-sm">
                <SelectValue placeholder="Selecciona tu licencia" />
              </SelectTrigger>
              <SelectContent className="bg-[#1E2329] border-[#2B3139]">
                {LICENCIAS.map((l) => (
                  <SelectItem key={l.id} value={l.id} className="text-[#EAECEF] focus:bg-[#2B3139] focus:text-[#F0B90B]">
                    <span className="flex items-center justify-between w-full gap-4">
                      <span>{l.label}</span>
                      <span className="text-[#F0B90B] font-semibold">{l.price}</span>
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {regLicencia && (
              <p className="text-xs text-[#848E9C]">Licencia seleccionada: <span className="text-[#F0B90B] font-medium">{LICENCIAS.find(l => l.id === regLicencia)?.label} - {LICENCIAS.find(l => l.id === regLicencia)?.price}</span></p>
            )}
          </div>
          <Button type="submit" disabled={loading} className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl h-11 text-sm transition-all disabled:opacity-50">
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Crear Cuenta Ejecutiva'}
          </Button>
          <p className="text-center text-sm text-[#848E9C]">
            ¿Ya tienes cuenta?{' '}
            <button type="button" onClick={() => { onOpenChange(false); onSwitchToLogin(); }} className="text-[#F0B90B] hover:underline font-medium">
              Inicia sesión
            </button>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}

/* ─── ADMIN PANEL ─── */

interface AdminUser {
  id: string;
  name: string;
  username: string;
  email: string;
  role: string;
  licencia: string;
  paymentHash: string;
  tradingPackage: string;
  createdAt: string;
  _count: { referrals: number };
}

interface AdminStats {
  totalUsers: number;
  totalReferrals: number;
  admins: number;
  totalCommissions: number;
  paidCommissions: number;
  pendingReferrals: number;
  confirmedReferrals: number;
  paidReferrals: number;
  recentUsers: number;
}

function AdminPanel({ onClose }: { onClose: () => void }) {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const { toast } = useToast();

  const loadData = async () => {
    try {
      const [usersRes, statsRes] = await Promise.all([
        fetch('/api/admin/users'),
        fetch('/api/admin/stats'),
      ]);
      if (usersRes.ok) {
        const data = await usersRes.json();
        setUsers(data.users);
      }
      if (statsRes.ok) {
        const data = await statsRes.json();
        setAdminStats(data.stats);
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo cargar la información.', variant: 'destructive' });
    }
    setLoading(false);
  };

  useEffect(() => { loadData(); }, []);

  const handleDelete = async (userId: string, name: string) => {
    if (!confirm(`¿Estás seguro de eliminar al usuario ${name}? Esta acción no se puede deshacer.`)) return;
    setActionLoading(userId);
    try {
      const res = await fetch(`/api/admin/users?id=${userId}`, { method: 'DELETE' });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Usuario eliminado', description: data.message });
        setUsers((prev) => prev.filter((u) => u.id !== userId));
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo eliminar.', variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const handleToggleRole = async (userId: string, currentRole: string) => {
    const newRole = currentRole === 'admin' ? 'user' : 'admin';
    setActionLoading(userId);
    try {
      const res = await fetch('/api/admin/users', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, role: newRole }),
      });
      const data = await res.json();
      if (res.ok) {
        toast({ title: 'Rol actualizado', description: data.message });
        setUsers((prev) => prev.map((u) => u.id === userId ? { ...u, role: newRole } : u));
      } else {
        toast({ title: 'Error', description: data.error, variant: 'destructive' });
      }
    } catch {
      toast({ title: 'Error', description: 'No se pudo actualizar el rol.', variant: 'destructive' });
    }
    setActionLoading(null);
  };

  const filtered = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.username.toLowerCase().includes(search.toLowerCase())
  );

  const fmtDate = (d: string) => new Date(d).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col">
      <header className="sticky top-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/gcrm-logo.png" alt="GCRM" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold text-gold-gradient">GCRM Admin</span>
            <Badge className="bg-red-500/10 text-red-400 border-red-500/20 text-xs"><ShieldCheck className="w-3 h-3 mr-1" />Administrador</Badge>
          </div>
          <Button onClick={onClose} variant="outline" className="border-[#2B3139] text-[#848E9C] hover:bg-[#1E2329] rounded-lg text-sm gap-2">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Volver al Dashboard
          </Button>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Admin Stats */}
          {loading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              {[...Array(8)].map((_, i) => (<div key={i} className="glass-card rounded-2xl p-5 animate-pulse"><div className="h-4 bg-[#2B3139] rounded w-16 mb-2" /><div className="h-7 bg-[#2B3139] rounded w-24" /></div>))}
            </div>
          ) : adminStats ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Users} title="Total Usuarios" value={String(adminStats.totalUsers)} subtitle={`${adminStats.recentUsers} nuevos (7d)`} color="#F0B90B" />
              <StatCard icon={UsersRound} title="Total Referidos" value={String(adminStats.totalReferrals)} subtitle={`${adminStats.pendingReferrals} pendientes`} color="#0ECB81" />
              <StatCard icon={DollarSign} title="Comisiones" value={`$${adminStats.totalCommissions.toFixed(2)}`} subtitle={`$${adminStats.paidCommissions.toFixed(2)} pagadas`} color="#2EB6EA" />
              <StatCard icon={ShieldCheck} title="Administradores" value={String(adminStats.admins)} subtitle="Usuarios con acceso admin" color="#FCD535" />
            </div>
          ) : null}

          {/* Controls */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <h2 className="text-xl font-bold text-[#EAECEF] flex items-center gap-2">
              <LayoutDashboard className="w-5 h-5 text-[#F0B90B]" />
              Gestión de Usuarios
            </h2>
            <Input
              placeholder="Buscar por nombre, email o usuario..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] rounded-xl h-10 text-sm w-full sm:w-80"
            />
          </div>

          {/* Users Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            {loading ? (
              <div className="p-8 text-center text-[#848E9C]"><Loader2 className="w-6 h-6 animate-spin mx-auto mb-2" />Cargando usuarios...</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-[#2B3139]">
                      <th className="text-left px-4 py-3 text-[#848E9C] font-medium">Usuario</th>
                      <th className="text-left px-4 py-3 text-[#848E9C] font-medium hidden md:table-cell">Email</th>
                      <th className="text-left px-4 py-3 text-[#848E9C] font-medium hidden lg:table-cell">Licencia</th>
                      <th className="text-left px-4 py-3 text-[#848E9C] font-medium hidden lg:table-cell">Trading</th>
                      <th className="text-center px-4 py-3 text-[#848E9C] font-medium">Referidos</th>
                      <th className="text-left px-4 py-3 text-[#848E9C] font-medium hidden sm:table-cell">Fecha</th>
                      <th className="text-center px-4 py-3 text-[#848E9C] font-medium">Rol</th>
                      <th className="text-center px-4 py-3 text-[#848E9C] font-medium">Acciones</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.length === 0 ? (
                      <tr><td colSpan={8} className="px-4 py-8 text-center text-[#5E6673]">No se encontraron usuarios.</td></tr>
                    ) : filtered.map((u) => (
                      <tr key={u.id} className="border-b border-[#2B3139]/50 hover:bg-[#2B3139]/30 transition-colors">
                        <td className="px-4 py-3">
                          <div>
                            <p className="text-[#EAECEF] font-medium text-sm">{u.name}</p>
                            {u.username && <p className="text-[#5E6673] text-xs">@{u.username}</p>}
                          </div>
                        </td>
                        <td className="px-4 py-3 hidden md:table-cell">
                          <p className="text-[#848E9C] text-xs">{u.email}</p>
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {u.licencia ? (
                            <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-[#F0B90B]/20 text-xs">
                              {LICENCIAS.find(l => l.id === u.licencia)?.label || u.licencia}
                            </Badge>
                          ) : <span className="text-[#5E6673] text-xs">-</span>}
                        </td>
                        <td className="px-4 py-3 hidden lg:table-cell">
                          {u.tradingPackage ? (
                            <Badge className="bg-[#0ECB81]/10 text-[#0ECB81] border-[#0ECB81]/20 text-xs">{u.tradingPackage} GCRM</Badge>
                          ) : <span className="text-[#5E6673] text-xs">-</span>}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span className="text-[#EAECEF] font-semibold">{u._count.referrals}</span>
                        </td>
                        <td className="px-4 py-3 hidden sm:table-cell">
                          <p className="text-[#848E9C] text-xs">{fmtDate(u.createdAt)}</p>
                        </td>
                        <td className="px-4 py-3 text-center">
                          <Badge className={u.role === 'admin' ? 'bg-red-500/10 text-red-400 border-red-500/20 text-xs' : 'bg-[#2B3139] text-[#848E9C] text-xs'}>
                            {u.role === 'admin' ? 'Admin' : 'User'}
                          </Badge>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-center gap-1">
                            <button
                              onClick={() => handleToggleRole(u.id, u.role)}
                              disabled={actionLoading === u.id}
                              className="p-1.5 rounded-lg hover:bg-[#2B3139] transition-colors disabled:opacity-50"
                              title={u.role === 'admin' ? 'Quitar admin' : 'Hacer admin'}
                            >
                              {actionLoading === u.id ? <Loader2 className="w-4 h-4 animate-spin text-[#848E9C]" /> : <ShieldCheck className={`w-4 h-4 ${u.role === 'admin' ? 'text-red-400' : 'text-[#0ECB81]'}`} />}
                            </button>
                            <button
                              onClick={() => handleDelete(u.id, u.name)}
                              disabled={actionLoading === u.id}
                              className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors disabled:opacity-50"
                              title="Eliminar usuario"
                            >
                              <Trash2 className="w-4 h-4 text-[#848E9C] hover:text-red-400" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
            <div className="p-4 border-t border-[#2B3139] text-center">
              <span className="text-[#5E6673] text-xs">{filtered.length} de {users.length} usuarios</span>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

/* ─── COMMISSIONS DASHBOARD ─── */

function Dashboard({ user, onLogout }: { user: SessionUser; onLogout: () => void }) {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [loggingOut, setLoggingOut] = useState(false);
  const [showAdmin, setShowAdmin] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const res = await fetch('/api/referrals');
        if (res.ok && !cancelled) {
          const data = await res.json();
          setStats(data.stats);
          setReferrals(data.referrals);
        }
      } catch {
        if (!cancelled) toast({ title: 'Error', description: 'No se pudieron cargar las comisiones.', variant: 'destructive' });
      }
      if (!cancelled) setLoading(false);
    };
    load();
    return () => { cancelled = true; };
  }, [toast]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await fetch('/api/auth/logout', { method: 'POST' });
      toast({ title: 'Sesión cerrada', description: 'Has cerrado sesión correctamente.' });
      onLogout();
      window.location.reload();
    } catch {
      toast({ title: 'Error', description: 'No se pudo cerrar sesión.', variant: 'destructive' });
    }
    setLoggingOut(false);
  };

  const statusConfig: Record<string, { color: string; bg: string; icon: typeof CheckCircle; label: string }> = {
    confirmed: { color: 'text-[#0ECB81]', bg: 'bg-[#0ECB81]/10', icon: CheckCircle, label: 'Confirmado' },
    paid: { color: 'text-[#F0B90B]', bg: 'bg-[#F0B90B]/10', icon: DollarSign, label: 'Pagado' },
    pending: { color: 'text-[#FCD535]', bg: 'bg-[#FCD535]/10', icon: Clock, label: 'Pendiente' },
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
  };

  if (showAdmin) {
    return <AdminPanel onClose={() => setShowAdmin(false)} />;
  }

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col">
      {/* Dashboard Navbar */}
      <header className="sticky top-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-b border-[#2B3139]">
        <div className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/gcrm-logo.png" alt="GCRM Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold text-gold-gradient">GCRM Exchange</span>
          </div>
          <div className="flex items-center gap-3">
            {user.role === 'admin' && (
              <Button onClick={() => setShowAdmin(true)} variant="outline"
                className="border-[#F0B90B]/30 text-[#F0B90B] hover:bg-[#F0B90B]/10 rounded-lg text-sm gap-2">
                <ShieldCheck className="w-4 h-4" />
                <span className="hidden sm:inline">Admin</span>
              </Button>
            )}
            <div className="hidden sm:flex items-center gap-2 text-sm text-[#848E9C]">
              <User className="w-4 h-4" />
              <span>{user.name}</span>
            </div>
            <Button onClick={handleLogout} disabled={loggingOut} variant="outline"
              className="border-[#2B3139] text-[#848E9C] hover:text-red-400 hover:border-red-400/30 rounded-lg text-sm gap-2">
              {loggingOut ? <Loader2 className="w-4 h-4 animate-spin" /> : <LogOut className="w-4 h-4" />}
              <span className="hidden sm:inline">Salir</span>
            </Button>
          </div>
        </div>
      </header>

      <main className="flex-1 py-8 md:py-12">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* Welcome Header */}
          <div className="mb-8">
            <h1 className="text-2xl md:text-3xl font-bold text-[#EAECEF] mb-2">
              Panel de <span className="text-gold-gradient">Comisiones</span>
            </h1>
            <p className="text-[#848E9C] text-sm">Bienvenido/a, <span className="text-[#EAECEF] font-medium">{user.name}</span>{user.licencia && (<>
              {' '}<Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-[#F0B90B]/20 text-xs ml-1">
                {LICENCIAS.find(l => l.id === user.licencia)?.label || user.licencia}
              </Badge></>)}.</p>
          </div>

          {/* Stats Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="glass-card rounded-2xl p-5 animate-pulse">
                  <div className="w-10 h-10 rounded-xl bg-[#2B3139] mb-3" />
                  <div className="h-4 bg-[#2B3139] rounded w-20 mb-2" />
                  <div className="h-7 bg-[#2B3139] rounded w-28" />
                </div>
              ))}
            </div>
          ) : stats ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
              <StatCard icon={DollarSign} title="Comisión Total" value={`$${stats.totalCommissions.toFixed(2)}`} subtitle={`${stats.totalReferrals} referidos`} color="#F0B90B" />
              <StatCard icon={CheckCircle} title="Confirmadas" value={`$${stats.confirmedCommissions.toFixed(2)}`} subtitle="Listas para cobrar" color="#0ECB81" />
              <StatCard icon={DollarSign} title="Pagadas" value={`$${stats.paidCommissions.toFixed(2)}`} subtitle="Ya depositadas" color="#2EB6EA" />
              <StatCard icon={Clock} title="Pendientes" value={`$${stats.pendingCommissions.toFixed(2)}`} subtitle="Esperando depósito" color="#FCD535" />
            </div>
          ) : null}

          {/* Commission Rate Highlight */}
          <div className="glass-card rounded-2xl p-5 mb-8 flex flex-col sm:flex-row items-center gap-4 border-[#F0B90B]/30">
            <div className="w-14 h-14 rounded-2xl bg-[#F0B90B]/10 flex items-center justify-center shrink-0">
              <Gift className="w-7 h-7 text-[#F0B90B]" />
            </div>
            <div className="flex-1 text-center sm:text-left">
              <h3 className="text-[#F0B90B] font-bold text-base">Tu tasa de comisión: 5%</h3>
              <p className="text-[#848E9C] text-sm">Por cada referido que deposite, ganas el 5% de su depósito automáticamente.</p>
            </div>
            <Badge className="bg-[#F0B90B]/10 text-[#F0B90B] border-[#F0B90B]/20 text-sm px-3 py-1 rounded-lg">ACTIVA</Badge>
          </div>

          {/* Referrals Table */}
          <div className="glass-card rounded-2xl overflow-hidden">
            <div className="p-5 border-b border-[#2B3139] flex items-center gap-3">
              <LayoutDashboard className="w-5 h-5 text-[#F0B90B]" />
              <h2 className="text-lg font-bold text-[#EAECEF]">Historial de Referidos</h2>
              <Badge variant="secondary" className="bg-[#2B3139] text-[#848E9C] text-xs">
                {referrals.length} registros
              </Badge>
            </div>

            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2B3139]">
                    <th className="text-left px-5 py-3 text-[#848E9C] font-medium">Referido</th>
                    <th className="text-left px-5 py-3 text-[#848E9C] font-medium">Red</th>
                    <th className="text-right px-5 py-3 text-[#848E9C] font-medium">Depósito</th>
                    <th className="text-right px-5 py-3 text-[#848E9C] font-medium">Comisión (5%)</th>
                    <th className="text-center px-5 py-3 text-[#848E9C] font-medium">Estado</th>
                    <th className="text-right px-5 py-3 text-[#848E9C] font-medium">Fecha</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.length === 0 ? (
                    <tr><td colSpan={6} className="text-center py-12 text-[#848E9C]">No tienes referidos aún. Comparte tu enlace.</td></tr>
                  ) : (
                    referrals.map((ref) => {
                      const sc = statusConfig[ref.status] || statusConfig.pending;
                      const StatusIcon = sc.icon;
                      return (
                        <tr key={ref.id} className="border-b border-[#2B3139]/50 hover:bg-[#2B3139]/30 transition-colors">
                          <td className="px-5 py-4">
                            <div>
                              <p className="text-[#EAECEF] font-medium">{ref.referredName}</p>
                              <p className="text-[#848E9C] text-xs">{ref.referredEmail}</p>
                            </div>
                          </td>
                          <td className="px-5 py-4 text-[#848E9C]">{ref.depositNetwork || '-'}</td>
                          <td className="px-5 py-4 text-right text-[#EAECEF] font-medium">${(ref.depositAmount || 0).toFixed(2)}</td>
                          <td className="px-5 py-4 text-right text-[#0ECB81] font-semibold">${ref.commission.toFixed(2)}</td>
                          <td className="px-5 py-4 text-center">
                            <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                              <StatusIcon className="w-3.5 h-3.5" />
                              {sc.label}
                            </span>
                          </td>
                          <td className="px-5 py-4 text-right text-[#848E9C]">{formatDate(ref.createdAt)}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden p-4 space-y-3">
              {referrals.length === 0 ? (
                <p className="text-center py-8 text-[#848E9C]">No tienes referidos aún.</p>
              ) : (
                referrals.map((ref) => {
                  const sc = statusConfig[ref.status] || statusConfig.pending;
                  const StatusIcon = sc.icon;
                  return (
                    <div key={ref.id} className="bg-[#0B0E11] rounded-xl p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <p className="text-[#EAECEF] font-medium text-sm">{ref.referredName}</p>
                          <p className="text-[#848E9C] text-xs">{ref.referredEmail}</p>
                        </div>
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${sc.bg} ${sc.color}`}>
                          <StatusIcon className="w-3 h-3" /> {sc.label}
                        </span>
                      </div>
                      <div className="grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[#848E9C] text-[10px]">Red</p>
                          <p className="text-[#EAECEF] text-xs font-medium">{ref.depositNetwork || '-'}</p>
                        </div>
                        <div>
                          <p className="text-[#848E9C] text-[10px]">Depósito</p>
                          <p className="text-[#EAECEF] text-xs font-medium">${(ref.depositAmount || 0).toFixed(2)}</p>
                        </div>
                        <div>
                          <p className="text-[#848E9C] text-[10px]">Comisión</p>
                          <p className="text-[#0ECB81] text-xs font-bold">${ref.commission.toFixed(2)}</p>
                        </div>
                      </div>
                      <p className="text-[#848E9C] text-[10px] mt-2 text-right">{formatDate(ref.createdAt)}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E11] border-t border-[#2B3139] mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="flex items-center justify-between gap-4">
            <span className="text-xs text-[#848E9C]">© 2025 GCRM Exchange. Todos los derechos reservados.</span>
            <div className="flex items-center gap-4 text-xs text-[#848E9C]">
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Términos</a>
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── STAT CARD ─── */

function StatCard({ icon: Icon, title, value, subtitle, color }: {
  icon: typeof DollarSign; title: string; value: string; subtitle: string; color: string;
}) {
  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: `${color}15` }}>
          <Icon className="w-5 h-5" style={{ color }} />
        </div>
        <span className="text-[#848E9C] text-xs font-medium uppercase tracking-wider">{title}</span>
      </div>
      <p className="text-2xl font-bold text-[#EAECEF] mb-1">{value}</p>
      <p className="text-[#848E9C] text-xs">{subtitle}</p>
    </div>
  );
}

/* ─── LANDING PAGE ─── */

function LandingPage({ onLogin, onRegister }: { onLogin: () => void; onRegister: () => void }) {
  const [formData, setFormData] = useState({ usuario: '', nombres: '', correo: '', password: '', red: '', hashPago: '', linkReferido: '', tradingGcrm: '' });
  const [showPassword, setShowPassword] = useState(false);
  const [selectedNetwork, setSelectedNetwork] = useState('');
  const [selectedLicencia, setSelectedLicencia] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const selectedNet = USDT_NETWORKS.find((n) => n.id === selectedNetwork);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nombres.trim()) {
      toast({ title: 'Campo requerido', description: 'Por favor ingresa tu nombre completo.', variant: 'destructive' });
      return;
    }
    if (!formData.correo.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.correo)) {
      toast({ title: 'Correo inválido', description: 'Por favor ingresa un correo electrónico válido.', variant: 'destructive' });
      return;
    }
    if (!formData.password || formData.password.length < 6) {
      toast({ title: 'Contraseña requerida', description: 'La contraseña debe tener al menos 6 caracteres.', variant: 'destructive' });
      return;
    }
    setIsSubmitting(true);
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);
    toast({ title: 'Solicitud enviada', description: 'Por favor inicia sesión para ver tus comisiones.' });
    onRegister();
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-b border-[#2B3139]">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/assets/gcrm-logo.png" alt="GCRM Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold text-gold-gradient">GCRM Exchange</span>
          </div>
          <div className="hidden md:flex items-center gap-6 text-sm text-[#848E9C]">
            <a href="#form" className="hover:text-[#F0B90B] transition-colors">Registro</a>
            <a href="#deposit" className="hover:text-[#F0B90B] transition-colors">Depositar</a>
            <a href="#exchanges" className="hover:text-[#F0B90B] transition-colors">Exchanges</a>
            <a href="#hotcoin" className="hover:text-[#F0B90B] transition-colors">Hotcoin</a>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onLogin} variant="outline" className="border-[#2B3139] text-[#EAECEF] hover:bg-[#1E2329] rounded-lg text-sm gap-2">
              <LogIn className="w-4 h-4" />
              <span className="hidden sm:inline">Ingresar</span>
            </Button>
          </div>
        </nav>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #0a0d12 0%, #0f1923 30%, #0B0E11 60%, #0d1117 100%)' }}>
          {/* Animated particle network */}
          <ParticleBackground />
          {/* Subtle radial glow */}
          <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at 70% 40%, rgba(240, 185, 11, 0.06) 0%, transparent 60%), radial-gradient(ellipse at 20% 80%, rgba(14, 203, 129, 0.04) 0%, transparent 50%)' }} />
          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32" style={{ zIndex: 2 }}>
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              <div className="flex-1 text-center lg:text-left animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                  <span className="text-[#F0B90B] text-xs font-medium">Listado en múltiples exchanges</span>
                </div>
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  <span className="text-[#EAECEF]">MIEMBROS EJECUTIVOS</span><br />
                  <span className="text-gold-gradient">GCRM Exchange</span>
                </h1>
                <p className="text-[#848E9C] text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  Registro oficial de Miembros Ejecutivos. Licencias desde <span className="text-[#F0B90B] font-semibold">$150</span>.
                  Recibe comisión del <span className="text-[#F0B90B] font-semibold">5%</span> por cada registro referido.
                </p>
                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button onClick={() => { toast({ title: 'Airdrop GCRM', description: 'Conectando al Airdrop... Se redirigirá a la plataforma de Airdrop.' }); }} size="lg"
                    className="w-full sm:w-auto bg-gradient-to-r from-[#F0B90B] to-[#F8D12F] hover:from-[#F8D12F] hover:to-[#F0B90B] text-[#0B0E11] font-bold rounded-xl px-8 py-6 text-base gap-2 transition-all hover:shadow-lg hover:shadow-[#F0B90B]/20">
                    <Plane className="w-5 h-5" />
                    Airdrop GCRM
                  </Button>
                  <Button onClick={onRegister} size="lg"
                    className="w-full sm:w-auto bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl px-8 py-6 text-base animate-pulse-gold">
                    Registro Ejecutivo <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                </div>
              </div>
              <div className="shrink-0 animate-coin-container">
                <div className="relative">
                  <img src="/assets/gcrm-coin.png" alt="GCRM Coin" className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain animate-coin-glow relative z-10" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <div key={f.title} className="glass-card rounded-2xl p-6 hover:border-[#F0B90B]/30 transition-all duration-300 group">
                  <div className="w-12 h-12 rounded-xl bg-[#F0B90B]/10 flex items-center justify-center mb-4 group-hover:bg-[#F0B90B]/20 transition-colors">
                    <f.icon className="w-6 h-6 text-[#F0B90B]" />
                  </div>
                  <h3 className="text-[#EAECEF] font-bold text-base mb-2">{f.title}</h3>
                  <p className="text-[#848E9C] text-sm leading-relaxed">{f.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Registration Form */}
        <section id="form" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-[#F0B90B] text-sm font-medium uppercase tracking-wider">Formulario de Registro</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#EAECEF] mb-3">
                  Registro Miembros Ejecutivos <span className="text-gold-gradient">GCRM</span>
                </h2>
                <p className="text-[#848E9C] text-sm">Selecciona tu licencia ejecutiva y completa el registro para acceder a comisiones del 5%.</p>
              </div>
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
                {/* Usuario */}
                <div className="space-y-2">
                  <Label htmlFor="usuario" className="text-[#EAECEF] text-sm font-medium flex items-center gap-2">
                    <User className="w-4 h-4 text-[#F0B90B]" />
                    Usuario
                  </Label>
                  <Input id="usuario" type="text" placeholder="Ingresa tu nombre de usuario" value={formData.usuario} onChange={(e) => setFormData((p) => ({ ...p, usuario: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm" />
                </div>
                {/* Nombres */}
                <div className="space-y-2">
                  <Label htmlFor="nombres" className="text-[#EAECEF] text-sm font-medium">Nombres Completos <span className="text-red-400">*</span></Label>
                  <Input id="nombres" type="text" placeholder="Ingresa tu nombre completo" value={formData.nombres} onChange={(e) => setFormData((p) => ({ ...p, nombres: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="correo" className="text-[#EAECEF] text-sm font-medium">Correo Electrónico <span className="text-red-400">*</span></Label>
                  <Input id="correo" type="email" placeholder="tucorreo@ejemplo.com" value={formData.correo} onChange={(e) => setFormData((p) => ({ ...p, correo: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm" />
                </div>
                {/* Contraseña */}
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-[#EAECEF] text-sm font-medium">Contraseña <span className="text-red-400">*</span></Label>
                  <div className="relative">
                    <Input id="password" type={showPassword ? 'text' : 'password'} placeholder="Mínimo 6 caracteres" value={formData.password} onChange={(e) => setFormData((p) => ({ ...p, password: e.target.value }))}
                      className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm pr-10" />
                    <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[#848E9C] hover:text-[#EAECEF] transition-colors">
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div id="deposit" className="space-y-2">
                  <Label className="text-[#EAECEF] text-sm font-medium">Depósito USDT - Selecciona Red</Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Selecciona la red de depósito" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E2329] border-[#2B3139]">
                      {USDT_NETWORKS.map((net) => (
                        <SelectItem key={net.id} value={net.id} className="text-[#EAECEF] focus:bg-[#2B3139] focus:text-[#F0B90B]">
                          <span className="flex items-center gap-2"><span>{net.icon}</span><span>{net.label}</span></span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedNet && (
                    <div className="mt-3 p-4 bg-[#0B0E11] rounded-xl border border-[#2B3139]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#848E9C] text-xs font-medium">{selectedNet.icon} Dirección {selectedNet.label}</span>
                        <CopyButton text={selectedNet.address} />
                      </div>
                      <p className="text-[#EAECEF] text-xs md:text-sm font-mono break-all leading-relaxed">{selectedNet.address}</p>
                    </div>
                  )}
                </div>
                {/* Hash Pago */}
                <div className="space-y-2">
                  <Label htmlFor="hashPago" className="text-[#EAECEF] text-sm font-medium flex items-center gap-2">
                    <Hash className="w-4 h-4 text-[#F0B90B]" />
                    Hash Pago
                  </Label>
                  <Input id="hashPago" type="text" placeholder="Ingresa el hash de tu pago USDT" value={formData.hashPago} onChange={(e) => setFormData((p) => ({ ...p, hashPago: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm font-mono" />
                  <p className="text-[#5E6673] text-xs">Pega aquí el hash de transacción de tu depósito USDT.</p>
                </div>
                {/* Codigo Usuario */}
                <div className="space-y-2">
                  <Label htmlFor="codigoUsuario" className="text-[#EAECEF] text-sm font-medium">Codigo Usuario</Label>
                  <Input id="codigoUsuario" type="text" placeholder="Ingresa tu codigo de usuario" value={formData.linkReferido} onChange={(e) => setFormData((p) => ({ ...p, linkReferido: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm" />
                </div>
                {/* TRADING GCRM */}
                <div className="space-y-2">
                  <Label className="text-[#EAECEF] text-sm font-medium flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-[#F0B90B]" />
                    TRADING GCRM
                  </Label>
                  <Select value={formData.tradingGcrm} onValueChange={(val) => setFormData((p) => ({ ...p, tradingGcrm: val }))}>
                    <SelectTrigger className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Selecciona tu paquete de Trading" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E2329] border-[#2B3139]">
                      {TRADING_GCRM_OPTIONS.map((opt) => (
                        <SelectItem key={opt.id} value={opt.id} className="text-[#EAECEF] focus:bg-[#2B3139] focus:text-[#F0B90B]">
                          <span className="flex items-center gap-2">
                            <TrendingUp className="w-4 h-4 text-[#0ECB81]" />
                            {opt.label}
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {formData.tradingGcrm && (
                    <div className="flex items-center gap-2 p-3 bg-[#0B0E11] rounded-lg border border-[#0ECB81]/20">
                      <TrendingUp className="w-4 h-4 text-[#0ECB81] shrink-0" />
                      <p className="text-xs text-[#848E9C]">
                        Paquete seleccionado: <span className="text-[#0ECB81] font-semibold">{TRADING_GCRM_OPTIONS.find(o => o.id === formData.tradingGcrm)?.label}</span>
                      </p>
                    </div>
                  )}
                </div>
                {/* Licencia Ejecutiva */}
                <div className="space-y-2">
                  <Label className="text-[#EAECEF] text-sm font-medium flex items-center gap-2">
                    <Crown className="w-4 h-4 text-[#F0B90B]" />
                    Licencia Ejecutiva
                  </Label>
                  <Select value={selectedLicencia} onValueChange={setSelectedLicencia}>
                    <SelectTrigger className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Selecciona tu nivel de licencia" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E2329] border-[#2B3139]">
                      {LICENCIAS.map((l) => (
                        <SelectItem key={l.id} value={l.id} className="text-[#EAECEF] focus:bg-[#2B3139] focus:text-[#F0B90B]">
                          <span className="flex items-center justify-between w-full gap-6">
                            <span className="flex items-center gap-2">
                              {l.id === 'supervisor' && <Crown className="w-4 h-4 text-[#F0B90B]" />}
                              {l.id === 'coordinador' && <Crown className="w-4 h-4 text-[#F0B90B]" />}
                              {l.id === 'promotor' && <Award className="w-4 h-4 text-[#F0B90B]" />}
                              {l.id === 'asociado' && <Star className="w-4 h-4 text-[#F0B90B]" />}
                              {l.label}
                            </span>
                            <span className="text-[#F0B90B] font-bold">{l.price}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {selectedLicencia && (
                    <div className="flex items-center gap-2 p-3 bg-[#0B0E11] rounded-lg border border-[#2B3139]">
                      <CheckCircle className="w-4 h-4 text-[#0ECB81] shrink-0" />
                      <p className="text-xs text-[#848E9C]">
                        Licencia <span className="text-[#F0B90B] font-semibold">{LICENCIAS.find(l => l.id === selectedLicencia)?.label}</span> - Inversión: <span className="text-[#EAECEF] font-semibold">{LICENCIAS.find(l => l.id === selectedLicencia)?.price} USDT</span>
                      </p>
                    </div>
                  )}
                </div>
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 rounded-xl border border-[#F0B90B]/20">
                  <Gift className="w-6 h-6 text-[#F0B90B] shrink-0" />
                  <div>
                    <p className="text-[#F0B90B] font-bold text-sm">Comisión 5% por Registro</p>
                    <p className="text-[#848E9C] text-xs">Gana un 5% de comisión automática por cada persona que se registre con tu enlace.</p>
                  </div>
                </div>
                <Button type="submit" disabled={isSubmitting}
                  className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl h-12 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                  {isSubmitting ? (
                    <span className="flex items-center gap-2"><div className="w-4 h-4 border-2 border-[#0B0E11]/30 border-t-[#0B0E11] rounded-full animate-spin" />Procesando...</span>
                  ) : (
                    <span className="flex items-center justify-center gap-2"><Users className="w-5 h-5" />Registrarme Ahora</span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* Exchanges Carousel */}
        <section id="exchanges" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6"><ExchangeCarousel /></div>
        </section>

        {/* Hotcoin */}
        <section id="hotcoin" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-5xl mx-auto px-4 md:px-6"><HotcoinSection /></div>
        </section>

        {/* Bottom CTA */}
        <section className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#EAECEF] mb-4">
              Comienza a Ganar con <span className="text-gold-gradient">GCRM</span> Hoy
            </h2>
            <p className="text-[#848E9C] text-base mb-8 max-w-xl mx-auto">
              Únete a miles de usuarios que ya están generando ingresos con la comisión del 5% por registro.
            </p>
            <Button onClick={onRegister} size="lg" className="bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl px-10 py-6 text-base">
              Registrarse Ahora <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-[#0B0E11] border-t border-[#2B3139] mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/assets/gcrm-logo.png" alt="GCRM" className="w-6 h-6 rounded-full" />
              <span className="text-sm text-[#848E9C]">© 2025 GCRM Exchange. Todos los derechos reservados.</span>
            </div>
            <div className="flex items-center gap-6 text-xs text-[#848E9C]">
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Términos</a>
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Privacidad</a>
              <a href="#" className="hover:text-[#F0B90B] transition-colors">Soporte</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ─── MAIN: VIEW ROUTER ─── */

export default function Home() {
  const [user, setUser] = useState<SessionUser | null>(null);
  const [checking, setChecking] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  // Check session on mount
  useEffect(() => {
    fetch('/api/auth/me')
      .then((res) => res.json())
      .then((data) => {
        if (data.user) setUser(data.user);
      })
      .catch(() => {})
      .finally(() => setChecking(false));
  }, []);

  if (checking) {
    return (
      <div className="min-h-screen bg-[#0B0E11] flex items-center justify-center">
        <Loader2 className="w-8 h-8 text-[#F0B90B] animate-spin" />
      </div>
    );
  }

  // Logged in → Dashboard
  if (user) {
    return (
      <>
        <Dashboard user={user} onLogout={() => setUser(null)} />
      </>
    );
  }

  // Not logged in → Landing + Login/Register dialogs
  return (
    <>
      <LandingPage onLogin={() => setShowLogin(true)} onRegister={() => setShowRegister(true)} />
      <LoginDialog open={showLogin} onOpenChange={setShowLogin} onSwitchToRegister={() => setShowRegister(true)} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} onSwitchToLogin={() => setShowLogin(true)} />
    </>
  );
}