'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/lib/authStore';
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

  const { user, isAuthenticated, isInitialized, initialize, logout } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && !isAuthenticated) {
      router.push('/login');
    }
  }, [isInitialized, isAuthenticated, router]);

  if (!isInitialized || !isAuthenticated) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(16,185,129,0.08),transparent_60%)]" />
        <div className="relative z-10 flex flex-col items-center gap-4">
          <div className="flex items-center justify-center w-14 h-14 rounded-2xl bg-emerald-500/10 text-emerald-450 border border-emerald-500/20 shadow-2xl animate-pulse">
            <Loader2 className="w-7 h-7 animate-spin text-emerald-450" />
          </div>
          <p className="text-xs font-semibold tracking-wider text-zinc-400 uppercase animate-pulse">Iniciando consola segura...</p>
        </div>
      </div>
    );
  }

  const activeTenant = {
    name: user?.company || 'Mi Empresa SaaS',
    taxId: user?.email === 'elias@misaas.cl' ? 'RUT: 77.654.321-K' : 'RUT: 76.845.912-K',
  };

  return (
    <div className="flex h-screen bg-zinc-50 dark:bg-[#0a0a0a] overflow-hidden">
      
      {/* --- SIDEBAR RESPONSIVO PARA MÓVIL --- */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm lg:hidden transition-opacity duration-300"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside className={`
        fixed inset-y-0 left-0 z-50 flex flex-col w-72 bg-white dark:bg-[#0e0e0e] 
        border-r border-zinc-100 dark:border-zinc-900 transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'}
      `}>
        
        {/* LOGO DE LA APLICACIÓN */}
        <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-100 dark:border-zinc-900">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-primary text-primary-foreground font-bold text-xl shadow-lg shadow-primary/20">
              F
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              Factura<span className="text-primary font-extrabold">SaaS</span>
            </span>
          </Link>
          <button 
            onClick={() => setSidebarOpen(false)}
            className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 lg:hidden"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SELECTOR DE TENANT (EMPRESA MULTI-INQUILINO) */}
        <div className="px-4 py-6 border-b border-zinc-100 dark:border-zinc-900 relative">
          <button 
            onClick={() => setTenantDropdownOpen(!tenantDropdownOpen)}
            className="flex items-center justify-between w-full p-3 rounded-xl bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/60 transition-all duration-200"
          >
            <div className="flex items-center gap-3 text-left">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-primary">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 truncate max-w-[140px]">
                  {activeTenant.name}
                </p>
                <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                  {activeTenant.taxId}
                </p>
              </div>
            </div>
            <ChevronDown className={`w-4 h-4 text-zinc-500 transition-transform ${tenantDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Menú desplegable simulado para cambiar de empresa */}
          {tenantDropdownOpen && (
            <div className="absolute left-4 right-4 mt-2 p-1.5 bg-white dark:bg-[#121212] border border-zinc-200 dark:border-zinc-800/80 rounded-xl shadow-xl z-50 animate-in fade-in-50 slide-in-from-top-1">
              <div className="px-3 py-1.5 text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                Mis Organizaciones
              </div>
              <button className="flex w-full items-center gap-2 p-2.5 rounded-lg text-sm bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white font-medium text-left">
                <span className="w-2 h-2 rounded-full bg-primary" />
                {activeTenant.name}
              </button>
              <button className="flex w-full items-center gap-2 p-2.5 rounded-lg text-sm hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 text-left transition-colors">
                <span className="w-2 h-2 rounded-full bg-zinc-300 dark:bg-zinc-700" />
                Empresa Constructora SpA
              </button>
              <div className="h-px bg-zinc-100 dark:bg-zinc-800 my-1" />
              <button className="flex w-full items-center justify-center p-2 rounded-lg text-xs text-primary font-semibold hover:bg-emerald-50/50 dark:hover:bg-emerald-950/20 transition-colors">
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
                    : 'text-zinc-600 dark:text-zinc-400 hover:bg-zinc-50 hover:text-zinc-900 dark:hover:bg-zinc-900/60 dark:hover:text-white'
                  }
                `}
              >
                <Icon className={`
                  w-5 h-5 transition-transform duration-200 group-hover:scale-105
                  ${isActive ? 'text-primary' : 'text-zinc-500 group-hover:text-zinc-900 dark:group-hover:text-white'}
                `} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* PERFIL DE USUARIO Y CIERRE DE SESIÓN */}
        <div className="p-4 border-t border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#0c0c0c]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-emerald-500/20 text-primary font-black tracking-wider text-xs">
              {user?.name 
                ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() 
                : 'US'}
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-zinc-900 dark:text-white truncate">
                {user?.name || 'Usuario'}
              </p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400 truncate">
                {user?.email || 'admin@misaas.cl'}
              </p>
            </div>
          </div>
          <button 
            onClick={() => {
              logout();
              toast.success('Sesión cerrada correctamente');
              router.push('/login');
            }}
            className="flex items-center justify-center gap-2 w-full px-4 py-2.5 rounded-xl border border-red-200 hover:border-red-300 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:border-red-950 dark:bg-red-950/20 dark:text-red-400 text-sm font-semibold transition-all duration-200 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* --- CONTENEDOR DE CONTENIDO PRINCIPAL --- */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* BARRA SUPERIOR DE ACCIONES */}
        <header className="flex items-center justify-between h-20 px-6 lg:px-8 bg-white dark:bg-[#0e0e0e] border-b border-zinc-100 dark:border-zinc-900 z-30">
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 lg:hidden text-zinc-700 dark:text-zinc-300"
            >
              <Menu className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-zinc-950 dark:text-white hidden sm:block">
              {pathname === '/' ? 'Dashboard General' : pathname.replace('/', '').toUpperCase()}
            </h2>
          </div>

          {/* ACCIONES DEL TOPBAR */}
          <div className="flex items-center gap-4">
            <button className="relative p-2.5 rounded-xl border border-zinc-100 dark:border-zinc-850 bg-zinc-50 hover:bg-zinc-100 dark:bg-zinc-900/50 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300 transition-all">
              <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full ring-2 ring-white dark:ring-[#0e0e0e]" />
              <Bell className="w-5 h-5" />
            </button>
            
            <div className="h-8 w-px bg-zinc-200 dark:bg-zinc-850" />
            
            <div className="flex items-center gap-3">
              <span className="text-sm font-semibold text-zinc-700 dark:text-zinc-300 hidden md:block">
                Soporte en Línea
              </span>
              <div className="w-2.5 h-2.5 rounded-full bg-primary animate-pulse" />
            </div>
          </div>
        </header>

        {/* PÁGINAS DENTRO DEL DASHBOARD */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-7xl mx-auto space-y-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
