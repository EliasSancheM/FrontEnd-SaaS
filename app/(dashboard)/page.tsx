'use client';

import React, { useEffect } from 'react';
import Link from 'next/link';
import { 
  TrendingUp, 
  Clock, 
  Users, 
  Plus, 
  ArrowUpRight, 
  FileText,
  DollarSign
} from 'lucide-react';
import FloatingCard3D from '@/components/dashboard/FloatingCard3D';
import { useSaaSStore } from '@/lib/store';
import { useAuthStore } from '@/lib/authStore';

interface MetricCardProps {
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function MetricCard({ title, value, change, isPositive, icon: Icon, color }: MetricCardProps) {
  return (
    <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all duration-305 hover:-translate-y-0.5 group">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold text-zinc-500 dark:text-zinc-400">{title}</span>
        <div className={`p-3 rounded-xl ${color} transition-transform duration-300 group-hover:scale-105`}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
      <div className="mt-4">
        <h3 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">{value}</h3>
        <p className="mt-1 text-xs font-semibold flex items-center gap-1">
          <span className={isPositive ? 'text-primary' : 'text-red-500'}>
            {isPositive ? '+' : ''}{change}
          </span>
          <span className="text-zinc-400 dark:text-zinc-500 font-normal">este mes</span>
        </p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const { clients, invoices, initialize, isInitialized } = useSaaSStore();
  const { user } = useAuthStore();

  useEffect(() => {
    initialize();
  }, [initialize]);

  // Recalculamos métricas en vivo en base al Zustand global
  const totalInvoiced = invoices.reduce((acc, inv) => acc + inv.amount, 0);
  const totalPending = invoices
    .filter(inv => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + inv.amount, 0);
  const activeClientsCount = clients.filter(c => c.status === 'active').length;

  // Mock de facturas recientes leídas desde el store (primeras 5)
  const recentInvoices = invoices.slice(0, 5).map(inv => ({
    id: inv.id,
    number: inv.number,
    client: inv.client,
    date: inv.issueDate,
    amount: `$${inv.amount.toLocaleString()}`,
    status: inv.status,
    statusLabel: inv.statusLabel
  }));

  const userName = user?.name ? user.name.split(' ')[0] : 'Usuario';
  const companyName = user?.company || 'tu empresa';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* SECCIÓN DE BIENVENIDA & ACCIÓN RÁPIDA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            ¡Hola, {userName}!
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Aquí tienes el resumen financiero y facturación de <span className="font-semibold text-zinc-800 dark:text-zinc-200">{companyName}</span> para hoy.
          </p>
        </div>
        <div>
          <Link 
            href="/invoices/create" 
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Nueva Factura
          </Link>
        </div>
      </div>

      {/* REJILLA DE MÉTRICAS CLAVE (KPIs) */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard 
          title="Ingresos del Mes" 
          value={`$${totalInvoiced.toLocaleString()}`} 
          change="12.5%" 
          isPositive={true}
          icon={TrendingUp}
          color="bg-emerald-500/10 text-primary dark:bg-emerald-500/5"
        />
        <MetricCard 
          title="Facturas Pendientes" 
          value={`$${totalPending.toLocaleString()}`} 
          change="-4.2%" 
          isPositive={false}
          icon={Clock}
          color="bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500"
        />
        <MetricCard 
          title="Clientes Activos" 
          value={`${activeClientsCount} clientes`} 
          change="8.3%" 
          isPositive={true}
          icon={Users}
          color="bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400"
        />
      </div>

      {/* SECCIÓN INFERIOR: FACTURAS RECIENTES & ACCESOS RÁPIDOS */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* TABLA DE FACTURAS RECIENTES */}
        <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl shadow-sm p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Últimas Facturas</h3>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Listado de transacciones emitidas recientemente.</p>
            </div>
            <Link 
              href="/invoices" 
              className="text-sm font-semibold text-primary hover:underline inline-flex items-center gap-1 group"
            >
              Ver todas
              <ArrowUpRight className="w-4 h-4 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-zinc-100 dark:border-zinc-900 pb-3 text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                  <th className="pb-3">Número</th>
                  <th className="pb-3">Cliente</th>
                  <th className="pb-3">Fecha</th>
                  <th className="pb-3">Monto</th>
                  <th className="pb-3 text-right">Estado</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                {recentInvoices.map((invoice) => (
                  <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                    <td className="py-4 font-semibold text-zinc-900 dark:text-white">{invoice.number}</td>
                    <td className="py-4 text-zinc-650 dark:text-zinc-350">{invoice.client}</td>
                    <td className="py-4 text-zinc-450 dark:text-zinc-500">{invoice.date}</td>
                    <td className="py-4 font-medium text-zinc-800 dark:text-zinc-200">{invoice.amount}</td>
                    <td className="py-4 text-right">
                      <span className={`
                        inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                        ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5' : ''}
                        ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                        ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                      `}>
                        {invoice.statusLabel}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* COLUMNA DERECHA: ACCIONES Y RESUMEN TRIBUTARIO */}
        <div className="space-y-6">

          {/* TARJETA INTERACTIVA 3D (THREE.JS / REACT THREE FIBER) */}
          <FloatingCard3D />
          
          {/* BANER DE ESTADO TRIBUTARIO */}
          <div className="bg-gradient-to-br from-emerald-600 to-teal-800 text-white rounded-2xl p-6 shadow-md shadow-emerald-700/10 relative overflow-hidden group">
            <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6 transition-transform duration-500 group-hover:scale-110">
              <FileText className="w-48 h-48" />
            </div>
            <div className="relative z-10">
              <span className="text-xs font-bold uppercase tracking-widest text-emerald-200 bg-white/10 px-2.5 py-1 rounded-full">
                Sii Chile Conectado
              </span>
              <h4 className="text-xl font-bold mt-4">Cumplimiento Tributario</h4>
              <p className="text-sm text-emerald-100/90 mt-2 font-medium leading-relaxed">
                Tu empresa se encuentra al día con la facturación electrónica mensual. Próximo cierre de mes en 10 días.
              </p>
              <div className="mt-6 flex justify-between items-center text-xs font-bold text-emerald-100">
                <span>Estatus: OK</span>
                <span className="bg-white text-emerald-800 px-3 py-1.5 rounded-lg">Ver Certificados</span>
              </div>
            </div>
          </div>

          {/* TARJETA DE REPORTE TRIBUTARIO */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              Impuestos Estimados (IVA)
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Débito Fiscal (Emitido)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">$1,035,500</span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Crédito Fiscal (Compras)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">$450,000</span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-900" />
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-zinc-900 dark:text-white">Neto Estimado F29</span>
                <span className="text-lg font-extrabold text-primary">$585,500</span>
              </div>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
