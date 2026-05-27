import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "react-hot-toast";
import Providers from "@/components/Providers";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "FacturaSaaS - Sistema de Facturación Premium",
  description: "Plataforma de facturación y cobro inteligente para empresas de rápido crecimiento.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-slate-50/50 dark:bg-[#0a0f1d] text-zinc-900 dark:text-zinc-100 relative overflow-x-hidden">
        {/* NEON BACKGROUND FLOATING AMBIENT BLOBS */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
          {/* Deep Violet/Purple Blob */}
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-violet-600/10 dark:bg-violet-600/20 blur-[120px] animate-drift-slow" />
          
          {/* Electric Indigo Blob */}
          <div className="absolute bottom-[10%] right-[-10%] w-[60%] h-[60%] rounded-full bg-indigo-600/10 dark:bg-indigo-600/20 blur-[150px] animate-drift-reverse" />
          
          {/* Neon Cyan Glow Blob */}
          <div className="absolute top-[40%] right-[20%] w-[35%] h-[35%] rounded-full bg-cyan-500/10 dark:bg-cyan-400/15 blur-[100px] animate-drift-slow" style={{ animationDelay: '-5s' }} />
        </div>

        <div className="relative z-10 min-h-full flex flex-col">
          <Providers>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: 'rgba(20, 20, 25, 0.9)',
                  color: '#fff',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  borderRadius: '12px',
                },
              }}
            />
            {children}
          </Providers>
        </div>
      </body>
    </html>
  );
}
