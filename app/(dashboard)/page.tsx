'use client';

import React, { useMemo } from 'react';
import Link from 'next/link';
import {
  TrendingUp,
  Clock,
  Users,
  Plus,
  ArrowUpRight,
  FileText,
  Loader2,
} from 'lucide-react';
import FloatingCard3D from '@/components/dashboard/FloatingCard3D';
import FinancialChart, { ChartDataPoint } from '@/components/dashboard/FinancialChart';
import { useAuthStore } from '@/lib/authStore';
import { useInvoices } from '@/lib/invoices';
import { useClients } from '@/lib/clients';
import { money, invoiceStatusLabel, toNumber } from '@/lib/format';

interface MetricCardProps {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}

function MetricCard({ title, value, icon: Icon, color }: MetricCardProps) {
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
      </div>
    </div>
  );
}

const MONTHS_ES = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export default function DashboardPage() {
  const { user } = useAuthStore();
  const { data: invoices = [], isLoading } = useInvoices();
  const { data: clients = [] } = useClients();

  const now = new Date();
  const thisMonth = now.getMonth();
  const thisYear = now.getFullYear();

  const totalThisMonth = invoices
    .filter((inv) => {
      const d = new Date(inv.issue_date);
      return d.getMonth() === thisMonth && d.getFullYear() === thisYear;
    })
    .reduce((acc, inv) => acc + toNumber(inv.total), 0);

  const totalPending = invoices
    .filter((inv) => inv.status === 'sent' || inv.status === 'draft' || inv.status === 'overdue')
    .reduce((acc, inv) => acc + toNumber(inv.total), 0);

  const activeClientsCount = clients.filter((c) => c.status === 'active').length;
  const taxEmitted = invoices.reduce((acc, inv) => acc + toNumber(inv.tax_total), 0);

  // Serie de ingresos de los últimos 6 meses, derivada de las facturas reales.
  const chartData = useMemo<ChartDataPoint[]>(() => {
    const buckets: ChartDataPoint[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date(thisYear, thisMonth - i, 1);
      const label = `${MONTHS_ES[d.getMonth()]} ${d.getFullYear()}`;
      const ingresos = invoices
        .filter((inv) => {
          const id = new Date(inv.issue_date);
          return id.getMonth() === d.getMonth() && id.getFullYear() === d.getFullYear();
        })
        .reduce((acc, inv) => acc + toNumber(inv.total), 0);
      buckets.push({ month: label, ingresos, gastos: 0 });
    }
    return buckets;
  }, [invoices, thisMonth, thisYear]);

  const recentInvoices = [...invoices]
    .sort((a, b) => new Date(b.issue_date).getTime() - new Date(a.issue_date).getTime())
    .slice(0, 5);

  const clientName = useMemo(() => {
    const map = new Map<number, string>();
    clients.forEach((c) => map.set(c.id, c.name));
    return (id: number) => map.get(id) ?? `Cliente #${id}`;
  }, [clients]);

  const userName = user?.name ? user.name.split(' ')[0] : 'Usuario';
  const companyName = user?.company || 'tu empresa';

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* BIENVENIDA */}
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

      {/* KPIs */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        <MetricCard
          title="Facturado este Mes"
          value={money(totalThisMonth)}
          icon={TrendingUp}
          color="bg-emerald-500/10 text-primary dark:bg-emerald-500/5"
        />
        <MetricCard
          title="Por Cobrar"
          value={money(totalPending)}
          icon={Clock}
          color="bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500"
        />
        <MetricCard
          title="Clientes Activos"
          value={`${activeClientsCount} clientes`}
          icon={Users}
          color="bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400"
        />
      </div>

      {/* GRÁFICO */}
      <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl shadow-sm p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-4">
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Ingresos por Mes</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Facturación emitida en los últimos 6 meses.</p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: 'hsl(250, 89%, 65%)' }} />
              <span className="text-zinc-500 dark:text-zinc-400 font-medium">Ingresos</span>
            </div>
          </div>
        </div>
        {isLoading ? (
          <div className="flex items-center justify-center h-[300px] text-zinc-400">
            <Loader2 className="w-7 h-7 animate-spin text-primary" />
          </div>
        ) : (
          <FinancialChart data={chartData} />
        )}
      </div>

      {/* INFERIOR */}
      <div className="grid gap-8 lg:grid-cols-3">
        {/* FACTURAS RECIENTES */}
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

          {isLoading ? (
            <div className="flex items-center justify-center py-12 text-zinc-400">
              <Loader2 className="w-6 h-6 animate-spin text-primary" />
            </div>
          ) : recentInvoices.length > 0 ? (
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
                      <td className="py-4 text-zinc-650 dark:text-zinc-350">{clientName(invoice.client_id)}</td>
                      <td className="py-4 text-zinc-450 dark:text-zinc-500">{invoice.issue_date}</td>
                      <td className="py-4 font-medium text-zinc-800 dark:text-zinc-200">{money(invoice.total)}</td>
                      <td className="py-4 text-right">
                        <span className={`
                          inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold
                          ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5' : ''}
                          ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                          ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                          ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                          ${invoice.status === 'cancelled' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                        `}>
                          {invoiceStatusLabel(invoice.status)}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="py-12 text-center">
              <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <p className="text-sm text-zinc-500 dark:text-zinc-400">Aún no has emitido facturas.</p>
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA */}
        <div className="space-y-6">
          <FloatingCard3D />

          {/* RESUMEN TRIBUTARIO (derivado de facturas reales) */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm">
            <h4 className="text-sm font-bold text-zinc-900 dark:text-white uppercase tracking-wider mb-4">
              IVA Emitido (estimado)
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-zinc-500 dark:text-zinc-400 font-medium">Débito Fiscal (Emitido)</span>
                <span className="font-bold text-zinc-800 dark:text-zinc-200">{money(taxEmitted)}</span>
              </div>
              <div className="h-px bg-zinc-100 dark:bg-zinc-900" />
              <p className="text-xs text-zinc-400 dark:text-zinc-500 leading-relaxed">
                Cálculo referencial basado en el IVA de las facturas emitidas. No constituye una declaración F29 oficial.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
