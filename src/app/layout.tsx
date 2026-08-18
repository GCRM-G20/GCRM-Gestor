import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://partners.gcrmaster.org'),
  title: "GCRM Exchange - Registro Miembros Ejecutivos",
  description: "Registro oficial de Miembros Ejecutivos GCRM. Licencias: Promotor, Coordinador, Senior, Supervisor. Comisión del 5% por referidos.",
  icons: {
    icon: "/assets/gcrm-coin.png",
  },
  openGraph: {
    type: 'website',
    siteName: 'GCRM Exchange',
    title: 'GCRM Exchange - Registro Miembros Ejecutivos',
    description: 'Registro oficial de Miembros Ejecutivos GCRM. Comisión del 5% por referidos.',
    url: 'https://partners.gcrmaster.org',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-background text-foreground`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
