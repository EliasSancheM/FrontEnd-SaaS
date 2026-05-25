'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
import { useSaaSStore } from '@/lib/store';
import toast from 'react-hot-toast';
import { 
  LayoutDashboard, 
  FileText, 
  Users, 
  Settings, 
  LogOut, 
  Menu, 
  X, 
  ChevronDown, 
  Bell,
  Building2,
  Loader2
} from 'lucide-react';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

interface SidebarItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const sidebarItems: SidebarItem[] = [
  { name: 'Inicio / Métricas', href: '/', icon: LayoutDashboard },
  { name: 'Facturas', href: '/invoices', icon: FileText },
  { name: 'Clientes', href: '/clients', icon: Users },
  { name: 'Configuración', href: '/settings', icon: Settings },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tenantDropdownOpen, setTenantDropdownOpen] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  const sidebarRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  const { user, isAuthenticated, isInitialized, initialize, logout } = useAuthStore();
  const saasStore = useSaaSStore();

  useGSAP(() => {
    if (isAuthenticated) {
      const tl = gsap.timeline();
      
      if (sidebarRef.current) {
        tl.fromTo(sidebarRef.current, 
          { x: -50, opacity: 0 }, 
          { x: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        );
      }
      
      if (headerRef.current) {
        tl.fromTo(headerRef.current,
          { y: -20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.4, ease: 'power2.out' },
          '-=0.3'
        );
      }

      if (contentRef.current) {
        tl.fromTo(contentRef.current,
          { y: 20, opacity: 0 },
          { y: 0, opacity: 1, duration: 0.5, ease: 'power2.out' },
          '-=0.2'
        );
      }
    }
  }, { scope: sidebarRef, dependencies: [isAuthenticated] });



  useEffect(() => {
    initialize();
  }, [initialize]);

  // Initialize SaaS store with user's data when authenticated
  useEffect(() => {
    if (isAuthenticated && user?.email) {
      saasStore.reinitialize(user.email);
    }
  }, [isAuthenticated, user?.email]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(20,184,166,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-primary/10 text-primary border border-primary/20 shadow-2xl animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase animate-pulse">Iniciando consola segura...</p>
        </div>
      </div>
    );
  }

  const handleLogout = () => {
    saasStore.clearContext();
    logout();
    toast.success('Sesión cerrada correctamente');
    router.push('/login');
  };

  const activeTenant = {
    name: user?.company || 'Mi Empresa SaaS',
    taxId: user?.email || '',
  };

  return (
    <div className="flex h-screen bg-background/50 backdrop-blur-[4px] overflow-hidden animate-fade-in-up">
      
      {/* --- SIDEBAR RESPONSIVO PARA MÓVIL --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside ref={sidebarRef} className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-card/95 backdrop-blur-xl 
        border-r border-border/60 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* LOGO DE LA APLICACIÓN */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-border">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              F
            </div>
            <span className="text-xl font-bold tracking-tight text-foreground">
              Factura<span className="text-primary font-extrabold">SaaS</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-muted-foreground hover:bg-muted lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE TENANT (EMPRESA MULTI-INQUILINO) */}
        <div className="px-4 py-6 border-b border-border relative">
          <button 
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-secondary hover:bg-secondary/80 border border-border/60 transition-all duration-300 hover:-translate-y-0.5"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-primary/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground truncate max-w-[140px]">
                  {activeTenant.name}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {activeTenant.taxId}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-muted-foreground transition-transform ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú desplegable simulado para cambiar de empresa */}
          {tenantDropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 p-1.5 bg-card border border-border/80 rounded-xl shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-muted-foreground uppercase tracking-wider">
                Mis Organizaciones
              </div>
              <button className="flex w-full items-center gap-2 p-2.5 rounded-lg text-sm bg-secondary text-foreground font-medium text-left">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {activeTenant.name}
              </button>
              <button className="flex w-full items-center gap-2 p-2.5 rounded-lg text-sm hover:bg-secondary/60 text-muted-foreground text-left transition-colors">
                <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                Empresa Constructora SpA
              </button>
              <div className="h-px bg-border my-1" />
              <button className="flex w-full items-center justify-center p-2 rounded-lg text-xs text-primary font-semibold hover:bg-primary/10 transition-colors">
                + Crear nueva empresa
              </button>
            </div>
          )}
        </div>

        {/* NAVEGACIÓN PRINCIPAL */}
        <nav className="flex-1 px-4 py-6 space-y-1.5 overflow-y-auto">
          {sidebarItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`
                  flex items-center gap-3.5 px-4 py-3 rounded-xl text-sm font-semibold transition-all duration-200 group
                  ${isActive 
                    ? 'bg-primary/10 text-primary border-l-4 border-primary pl-3' 
                    : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-primary scale-110' : 'text-muted-foreground group-hover:text-foreground'}
                `} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PERFIL DE USUARIO Y CIERRE DE SESIÓN */}
        <div className="p-4 border-t border-border bg-card">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/20 text-primary font-black tracking-wider text-xs shadow-sm">
              {user?.name 
                ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
                : 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-foreground truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-[11px] text-muted-foreground truncate">
                {user?.email || 'admin@misaas.cl'}
              </p>
            </div>
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-destructive/20 hover:border-destructive/40 bg-destructive/5 hover:bg-destructive/10 text-destructive text-sm font-semibold transition-all duration-300 cursor-pointer hover:-translate-y-0.5"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENEDOR DE CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <header ref={headerRef} className="flex items-center justify-between h-20 px-6 lg:px-8 bg-card/95 backdrop-blur-xl border-b border-border/60 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-border hover:bg-secondary lg:hidden text-foreground transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-foreground hidden sm:block">
              {pathname === '/' ? 'Dashboard General' : pathname.replace('/', '').toUpperCase()}
            </h2>
          </div>

          {/* ACCIONES DEL TOPBAR */}
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl border border-border bg-secondary hover:bg-secondary/80 text-foreground transition-all duration-300 hover:-translate-y-0.5">
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-destructive rounded-full ring-2 ring-card" />
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-px bg-border" />
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-foreground hidden md:block">
                Soporte en Línea
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </header>

        {/* PÁGINAS DENTRO DEL DASHBOARD */}
        <main ref={contentRef} className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
