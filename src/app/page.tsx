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
import { Copy, Check, ChevronDown, ChevronUp, ExternalLink, Shield, Zap, Gift, ArrowRight, Wallet, Globe, Users, TrendingUp } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

/* ─── DATA ─── */

const USDT_NETWORKS = [
  {
    id: 'bep20',
    label: 'BEP 20 (BSC)',
    address: '0xB4C692980666A2260F40123D6772Bec2ae464ea2',
    icon: '🔷',
  },
  {
    id: 'trx',
    label: 'TRX (TRC 20)',
    address: 'TL7NByppdqJc3EymPdu7yqDYwmy7rDJKQm',
    icon: '🔺',
  },
  {
    id: 'sol',
    label: 'SOL (Solana)',
    address: '74rwLcYBkYwADog7QwWa4PcomXUN9TX6da2CU7WYsnjA',
    icon: '🟣',
  },
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

const FEATURES = [
  {
    icon: Shield,
    title: 'Seguridad Total',
    desc: 'Tecnología de seguridad de nivel bancario con encriptación de 256 bits y autenticación multi-factor.',
  },
  {
    icon: Zap,
    title: 'Transacciones Rápidas',
    desc: 'Procesamiento de depósitos en tiempo real con confirmación en la red blockchain.',
  },
  {
    icon: Gift,
    title: 'Comisión 5%',
    desc: 'Gana una comisión del 5% por cada registro referido. Programa de referidos ilimitado.',
  },
  {
    icon: TrendingUp,
    title: 'Listado Global',
    desc: 'GCRM está listado en los principales exchanges del mundo: Binance, Coinbase, MEXC y más.',
  },
];

/* ─── COMPONENTS ─── */

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast({
        title: 'Dirección copiada',
        description: 'La dirección ha sido copiada al portapapeles.',
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: 'Error al copiar',
        description: 'No se pudo copiar la dirección.',
        variant: 'destructive',
      });
    }
  };

  return (
    <button
      onClick={handleCopy}
      className="shrink-0 p-2 rounded-lg bg-[#2B3139] hover:bg-[#3B434D] transition-colors"
      aria-label="Copiar dirección"
    >
      {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4 text-[#848E9C]" />}
    </button>
  );
}

function ExchangeLogo({ name, color, initial }: { name: string; color: string; initial: string }) {
  return (
    <div className="flex flex-col items-center gap-2 min-w-[100px]">
      <div
        className="w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center text-xl md:text-2xl font-bold transition-all duration-300 hover:scale-110 hover:shadow-lg"
        style={{
          background: `linear-gradient(135deg, ${color}22, ${color}44)`,
          border: `1px solid ${color}55`,
          color: color,
        }}
      >
        {initial}
      </div>
      <span className="text-[#848E9C] text-xs md:text-sm font-medium">{name}</span>
    </div>
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
    const amount = 200;
    el.scrollBy({ left: dir === 'left' ? -amount : amount, behavior: 'smooth' });
  };

  // Double the items for infinite feel
  const items = [...EXCHANGES, ...EXCHANGES];

  return (
    <div className="relative w-full">
      {/* CoinMarketCap style header */}
      <div className="text-center mb-6">
        <p className="text-[#848E9C] text-sm uppercase tracking-widest mb-1">Listado en Exchanges</p>
        <h2 className="text-xl md:text-2xl font-bold text-[#EAECEF]">
          Disponible en los Mejores <span className="text-gold-gradient">Exchanges</span> del Mundo
        </h2>
      </div>

      {/* Scrollable container */}
      <div className="relative group">
        {canScrollLeft && (
          <button
            onClick={() => scroll('left')}
            className="absolute left-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E2329] border border-[#2B3139] flex items-center justify-center hover:bg-[#2B3139] transition-all opacity-0 group-hover:opacity-100"
            aria-label="Anterior"
          >
            <ChevronUp className="w-5 h-5 rotate-[-90deg] text-[#EAECEF]" />
          </button>
        )}
        {canScrollRight && (
          <button
            onClick={() => scroll('right')}
            className="absolute right-0 top-1/2 -translate-y-1/2 z-10 w-10 h-10 rounded-full bg-[#1E2329] border border-[#2B3139] flex items-center justify-center hover:bg-[#2B3139] transition-all opacity-0 group-hover:opacity-100"
            aria-label="Siguiente"
          >
            <ChevronDown className="w-5 h-5 rotate-90 text-[#EAECEF]" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-6 overflow-x-auto py-4 px-2 snap-x snap-mandatory scrollbar-hide"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {items.map((ex, i) => (
            <div key={`${ex.name}-${i}`} className="snap-center shrink-0">
              <ExchangeLogo {...ex} />
            </div>
          ))}
        </div>
      </div>

      {/* CoinMarketCap badge */}
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
        {/* Hotcoin Logo */}
        <div className="shrink-0">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[#1E90FF] to-[#0066CC] flex items-center justify-center">
            <span className="text-white text-2xl font-bold">H</span>
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center md:text-left">
          <h3 className="text-xl md:text-2xl font-bold text-[#EAECEF] mb-2">
            GCRM en <span className="text-[#1E90FF]">Hotcoin</span>
          </h3>
          <p className="text-[#848E9C] text-sm md:text-base leading-relaxed">
            GCRM token ya está disponible para trading en Hotcoin Exchange. Realiza tus operaciones de compra y venta
            de manera segura en una de las plataformas más confiables del mercado cripto.
          </p>
        </div>

        {/* CTA */}
        <a
          href="https://www.hotcoin.com"
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 flex items-center gap-2 px-6 py-3 rounded-xl bg-[#1E90FF] hover:bg-[#1A7AE6] text-white font-semibold text-sm transition-all hover:shadow-lg hover:shadow-[#1E90FF]/20"
        >
          Operar Ahora
          <ExternalLink className="w-4 h-4" />
        </a>
      </div>

      {/* Trading pair info */}
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

/* ─── MAIN PAGE ─── */

export default function Home() {
  const [formData, setFormData] = useState({
    nombres: '',
    correo: '',
    red: '',
    linkReferido: '',
    oficinaVirtual: '',
  });
  const [selectedNetwork, setSelectedNetwork] = useState('');
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

    setIsSubmitting(true);
    // Simulate submission
    await new Promise((r) => setTimeout(r, 1500));
    setIsSubmitting(false);

    toast({
      title: 'Registro exitoso',
      description: `Bienvenido/a ${formData.nombres}. Recibirás tu comisión del 5% por registro.`,
    });

    setFormData({ nombres: '', correo: '', red: '', linkReferido: '', oficinaVirtual: '' });
    setSelectedNetwork('');
  };

  return (
    <div className="min-h-screen bg-[#0B0E11] flex flex-col">
      {/* ─── NAVBAR ─── */}
      <header className="sticky top-0 z-50 bg-[#0B0E11]/95 backdrop-blur-md border-b border-[#2B3139]">
        <nav className="max-w-7xl mx-auto px-4 md:px-6 h-16 flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <img src="/assets/gcrm-logo.png" alt="GCRM Logo" className="w-8 h-8 rounded-full" />
            <span className="text-xl font-bold text-gold-gradient">GCRM Exchange</span>
          </div>

          {/* Nav Links (desktop) */}
          <div className="hidden md:flex items-center gap-6 text-sm text-[#848E9C]">
            <a href="#form" className="hover:text-[#F0B90B] transition-colors">Registro</a>
            <a href="#deposit" className="hover:text-[#F0B90B] transition-colors">Depositar</a>
            <a href="#exchanges" className="hover:text-[#F0B90B] transition-colors">Exchanges</a>
            <a href="#hotcoin" className="hover:text-[#F0B90B] transition-colors">Hotcoin</a>
          </div>

          {/* CTA */}
          <Button
            onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
            className="bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-semibold text-sm rounded-lg px-5"
          >
            Registrarse
          </Button>
        </nav>
      </header>

      <main className="flex-1">
        {/* ─── HERO + BANNER ─── */}
        <section className="relative overflow-hidden">
          {/* Banner Image */}
          <div className="absolute inset-0">
            <img
              src="/assets/banner.png"
              alt="GCRM Banner"
              className="w-full h-full object-cover opacity-30"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-[#0B0E11]/60 via-[#0B0E11]/80 to-[#0B0E11]" />
          </div>

          <div className="relative max-w-7xl mx-auto px-4 md:px-6 py-16 md:py-24 lg:py-32">
            <div className="flex flex-col lg:flex-row items-center gap-12 lg:gap-16">
              {/* Left - Text */}
              <div className="flex-1 text-center lg:text-left animate-fade-in-up">
                <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#F0B90B]/10 border border-[#F0B90B]/20 mb-6">
                  <div className="w-2 h-2 rounded-full bg-[#0ECB81] animate-pulse" />
                  <span className="text-[#F0B90B] text-xs font-medium">Listado en múltiples exchanges</span>
                </div>

                <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
                  <span className="text-[#EAECEF]">Regístrate en</span>
                  <br />
                  <span className="text-gold-gradient">GCRM Exchange</span>
                </h1>

                <p className="text-[#848E9C] text-base md:text-lg leading-relaxed mb-8 max-w-lg mx-auto lg:mx-0">
                  Deposita USDT y recibe una comisión del <span className="text-[#F0B90B] font-semibold">5%</span> por cada registro.
                  GCRM está disponible en Binance, Coinbase, MEXC, KuCoin y más.
                </p>

                <div className="flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start">
                  <Button
                    onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
                    size="lg"
                    className="w-full sm:w-auto bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl px-8 py-6 text-base animate-pulse-gold"
                  >
                    Comenzar Ahora
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </Button>
                  <Button
                    variant="outline"
                    size="lg"
                    onClick={() => document.getElementById('exchanges')?.scrollIntoView({ behavior: 'smooth' })}
                    className="w-full sm:w-auto border-[#2B3139] text-[#EAECEF] hover:bg-[#1E2329] rounded-xl px-8 py-6 text-base"
                  >
                    Ver Exchanges
                  </Button>
                </div>
              </div>

              {/* Right - Coin graphic */}
              <div className="shrink-0 animate-float">
                <div className="relative">
                  <img
                    src="/assets/gcrm-coin.png"
                    alt="GCRM Coin"
                    className="w-48 h-48 md:w-64 md:h-64 lg:w-72 lg:h-72 object-contain drop-shadow-2xl"
                  />
                  {/* Glow effect */}
                  <div className="absolute inset-0 rounded-full bg-[#F0B90B]/10 blur-3xl -z-10 scale-150" />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {FEATURES.map((f, i) => (
                <div
                  key={f.title}
                  className="glass-card rounded-2xl p-6 hover:border-[#F0B90B]/30 transition-all duration-300 group"
                  style={{ animationDelay: `${i * 100}ms` }}
                >
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

        {/* ─── REGISTRATION FORM ─── */}
        <section id="form" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <div className="max-w-2xl mx-auto">
              {/* Header */}
              <div className="text-center mb-10">
                <div className="inline-flex items-center gap-2 mb-4">
                  <Wallet className="w-5 h-5 text-[#F0B90B]" />
                  <span className="text-[#F0B90B] text-sm font-medium uppercase tracking-wider">Formulario de Registro</span>
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-[#EAECEF] mb-3">
                  Crea tu Cuenta <span className="text-gold-gradient">GCRM</span>
                </h2>
                <p className="text-[#848E9C] text-sm">
                  Completa el formulario para registrarte y recibir tu comisión del 5%.
                </p>
              </div>

              {/* Form Card */}
              <form onSubmit={handleSubmit} className="glass-card rounded-2xl p-6 md:p-8 space-y-6">
                {/* Nombres */}
                <div className="space-y-2">
                  <Label htmlFor="nombres" className="text-[#EAECEF] text-sm font-medium">
                    Nombres Completos <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="nombres"
                    type="text"
                    placeholder="Ingresa tu nombre completo"
                    value={formData.nombres}
                    onChange={(e) => setFormData((p) => ({ ...p, nombres: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm"
                  />
                </div>

                {/* Correo */}
                <div className="space-y-2">
                  <Label htmlFor="correo" className="text-[#EAECEF] text-sm font-medium">
                    Correo Electrónico <span className="text-red-400">*</span>
                  </Label>
                  <Input
                    id="correo"
                    type="email"
                    placeholder="tucorreo@ejemplo.com"
                    value={formData.correo}
                    onChange={(e) => setFormData((p) => ({ ...p, correo: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm"
                  />
                </div>

                {/* Depósito USDT - Red */}
                <div id="deposit" className="space-y-2">
                  <Label className="text-[#EAECEF] text-sm font-medium">
                    Depósito USDT - Selecciona Red
                  </Label>
                  <Select value={selectedNetwork} onValueChange={setSelectedNetwork}>
                    <SelectTrigger className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] rounded-xl h-12 text-sm">
                      <SelectValue placeholder="Selecciona la red de depósito" />
                    </SelectTrigger>
                    <SelectContent className="bg-[#1E2329] border-[#2B3139]">
                      {USDT_NETWORKS.map((net) => (
                        <SelectItem
                          key={net.id}
                          value={net.id}
                          className="text-[#EAECEF] focus:bg-[#2B3139] focus:text-[#F0B90B]"
                        >
                          <span className="flex items-center gap-2">
                            <span>{net.icon}</span>
                            <span>{net.label}</span>
                          </span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {/* Show address when network selected */}
                  {selectedNet && (
                    <div className="mt-3 p-4 bg-[#0B0E11] rounded-xl border border-[#2B3139]">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[#848E9C] text-xs font-medium">
                          {selectedNet.icon} Dirección {selectedNet.label}
                        </span>
                        <CopyButton text={selectedNet.address} />
                      </div>
                      <p className="text-[#EAECEF] text-xs md:text-sm font-mono break-all leading-relaxed">
                        {selectedNet.address}
                      </p>
                    </div>
                  )}
                </div>

                {/* Link Referido */}
                <div className="space-y-2">
                  <Label htmlFor="linkReferido" className="text-[#EAECEF] text-sm font-medium">
                    Link Referido
                  </Label>
                  <Input
                    id="linkReferido"
                    type="text"
                    placeholder="https://tu-link-referido.com"
                    value={formData.linkReferido}
                    onChange={(e) => setFormData((p) => ({ ...p, linkReferido: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm"
                  />
                </div>

                {/* Oficina Virtual */}
                <div className="space-y-2">
                  <Label htmlFor="oficinaVirtual" className="text-[#EAECEF] text-sm font-medium">
                    <span className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-[#F0B90B]" />
                      Oficina Virtual
                    </span>
                  </Label>
                  <Input
                    id="oficinaVirtual"
                    type="text"
                    placeholder="URL de tu oficina virtual"
                    value={formData.oficinaVirtual}
                    onChange={(e) => setFormData((p) => ({ ...p, oficinaVirtual: e.target.value }))}
                    className="bg-[#2B3139] border-[#2B3139] text-[#EAECEF] placeholder:text-[#5E6673] focus:border-[#F0B90B] focus:ring-[#F0B90B]/20 rounded-xl h-12 text-sm"
                  />
                </div>

                {/* Commission Badge */}
                <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-[#F0B90B]/10 to-[#F0B90B]/5 rounded-xl border border-[#F0B90B]/20">
                  <Gift className="w-6 h-6 text-[#F0B90B] shrink-0" />
                  <div>
                    <p className="text-[#F0B90B] font-bold text-sm">Comisión 5% por Registro</p>
                    <p className="text-[#848E9C] text-xs">Gana un 5% de comisión automática por cada persona que se registre con tu enlace.</p>
                  </div>
                </div>

                {/* Submit */}
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl h-12 text-base transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-[#0B0E11]/30 border-t-[#0B0E11] rounded-full animate-spin" />
                      Procesando...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center gap-2">
                      <Users className="w-5 h-5" />
                      Registrarme Ahora
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </div>
        </section>

        {/* ─── EXCHANGE CAROUSEL ─── */}
        <section id="exchanges" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-7xl mx-auto px-4 md:px-6">
            <ExchangeCarousel />
          </div>
        </section>

        {/* ─── HOTCOIN SECTION ─── */}
        <section id="hotcoin" className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-5xl mx-auto px-4 md:px-6">
            <HotcoinSection />
          </div>
        </section>

        {/* ─── BOTTOM CTA ─── */}
        <section className="py-16 md:py-20 bg-[#0B0E11]">
          <div className="max-w-4xl mx-auto px-4 md:px-6 text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-[#EAECEF] mb-4">
              Comienza a Ganar con <span className="text-gold-gradient">GCRM</span> Hoy
            </h2>
            <p className="text-[#848E9C] text-base mb-8 max-w-xl mx-auto">
              Únete a miles de usuarios que ya están generando ingresos con la comisión del 5% por registro.
              No te quedes fuera.
            </p>
            <Button
              onClick={() => document.getElementById('form')?.scrollIntoView({ behavior: 'smooth' })}
              size="lg"
              className="bg-[#F0B90B] hover:bg-[#F8D12F] text-[#0B0E11] font-bold rounded-xl px-10 py-6 text-base"
            >
              Registrarse Ahora
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </div>
        </section>
      </main>

      {/* ─── FOOTER ─── */}
      <footer className="bg-[#0B0E11] border-t border-[#2B3139] mt-auto">
        <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src="/assets/gcrm-logo.png" alt="GCRM" className="w-6 h-6 rounded-full" />
              <span className="text-sm text-[#848E9C]">
                © 2025 GCRM Exchange. Todos los derechos reservados.
              </span>
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
