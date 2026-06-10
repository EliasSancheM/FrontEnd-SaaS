'use client';

import React, { use, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Download,
  CreditCard,
  Trash2,
  CheckCircle,
  AlertCircle,
  Clock,
  Calendar,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { useInvoice, useMarkInvoicePaid, useDeleteInvoice, downloadInvoicePdf } from '@/lib/invoices';
import { startCheckout } from '@/lib/payments';
import { useAuthStore } from '@/lib/authStore';
import { money, invoiceStatusLabel, toNumber } from '@/lib/format';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

const toastStyle = {
  style: {
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
  },
};

export default function InvoiceDetailContent({ params }: InvoiceDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { data: invoice, isLoading } = useInvoice(id);
  const { companySettings } = useAuthStore();
  const markPaid = useMarkInvoicePaid();
  const deleteInvoice = useDeleteInvoice();

  const [downloading, setDownloading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState<null | 'mercadopago' | 'paypal'>(null);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400">Cargando documento electrónico...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-650 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Factura no encontrada</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          El documento tributario electrónico que estás buscando no existe o ha sido eliminado.
        </p>
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Facturas
        </Link>
      </div>
    );
  }

  const client = invoice.client;
  const items = invoice.items ?? [];

  const handleMarkAsPaid = () => {
    markPaid.mutate(invoice.id, {
      onSuccess: () => toast.success(`Factura ${invoice.number} marcada como PAGADA.`, { icon: '💰', ...toastStyle }),
      onError: () => toast.error('No se pudo actualizar la factura', toastStyle),
    });
  };

  const handleCheckout = async (provider: 'mercadopago' | 'paypal') => {
    setCheckoutLoading(provider);
    try {
      const url = await startCheckout(invoice.id, toNumber(invoice.total), provider);
      window.location.href = url;
    } catch {
      toast.error('No se pudo iniciar el pago. Verifica las credenciales de la pasarela.', toastStyle);
      setCheckoutLoading(null);
    }
  };

  const handleDelete = () => {
    if (!confirm(`¿Estás seguro de que deseas eliminar la factura ${invoice.number}? Esta acción es irreversible.`)) return;
    deleteInvoice.mutate(invoice.id, {
      onSuccess: () => {
        toast.success('Factura eliminada correctamente', toastStyle);
        router.push('/invoices');
      },
      onError: () => toast.error('No se pudo eliminar la factura', toastStyle),
    });
  };

  const handleDownload = async () => {
    setDownloading(true);
    const t = toast.loading(`Generando PDF de ${invoice.number}...`, toastStyle);
    try {
      await downloadInvoicePdf(invoice.id, invoice.number);
      toast.success('PDF descargado', { id: t, ...toastStyle });
    } catch {
      toast.error('No se pudo descargar el PDF', { id: t, ...toastStyle });
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* CABECERA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/invoices"
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-zinc-650 dark:text-zinc-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">{invoice.number}</h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-450' : ''}
                ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                ${invoice.status === 'cancelled' ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400' : ''}
              `}>
                {invoiceStatusLabel(invoice.status)}
              </span>
            </div>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-1">
              Detalle del documento y cobro integrado.
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* PANEL DE ACCIONES */}
        <div className="space-y-6">
          {/* CICLO DE VIDA */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ciclo de Vida de Facturación
            </h3>

            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-[11px] before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-900">
              <div className="relative flex gap-3 text-sm">
                <span className="absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black bg-emerald-500/10 border-emerald-500 text-emerald-500">1</span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Factura Creada</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Documento guardado en la base de datos</p>
                </div>
              </div>

              <div className="relative flex gap-3 text-sm">
                <span className={`absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black ${
                  invoice.status === 'sent' || invoice.status === 'paid' || invoice.status === 'overdue'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800'
                }`}>2</span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Emitida</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Enviada al receptor</p>
                </div>
              </div>

              <div className="relative flex gap-3 text-sm">
                <span className={`absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800'
                }`}>3</span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Cobrada / Liquidada</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Transacción aprobada y fondos acreditados</p>
                </div>
              </div>
            </div>
          </div>

          {/* OPERACIONES */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Operaciones Disponibles</h3>

            {invoice.status !== 'paid' && (
              <div className="space-y-3">
                <button
                  onClick={() => handleCheckout('mercadopago')}
                  disabled={checkoutLoading !== null}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/25 transition-all duration-200 cursor-pointer text-sm disabled:opacity-60"
                >
                  {checkoutLoading === 'mercadopago' ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <CreditCard className="w-4.5 h-4.5" />}
                  Pagar con Mercado Pago
                </button>

                <button
                  onClick={() => handleCheckout('paypal')}
                  disabled={checkoutLoading !== null}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-[#ffc439] to-[#ffb300] hover:from-[#ffd269] hover:to-[#ffc439] text-blue-900 font-black rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer text-sm disabled:opacity-60"
                >
                  {checkoutLoading === 'paypal' ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <span className="tracking-tight italic text-base">Pay<span className="text-[#003087]">Pal</span></span>}
                </button>

                <button
                  onClick={handleMarkAsPaid}
                  disabled={markPaid.isPending}
                  className="w-full flex items-center justify-center gap-2.5 py-2 px-4 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-250 font-bold rounded-xl transition-all cursor-pointer text-xs disabled:opacity-60"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-550" />
                  Registrar Pago Manual
                </button>
              </div>
            )}

            <button
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-250 font-bold rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50"
            >
              {downloading ? <Loader2 className="w-4.5 h-4.5 animate-spin" /> : <Download className="w-4.5 h-4.5 text-primary" />}
              Descargar PDF
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />

            <button
              onClick={handleDelete}
              disabled={deleteInvoice.isPending}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-red-500/5 hover:bg-red-500/10 text-red-650 dark:text-red-400 font-semibold border border-red-200 dark:border-red-950/80 rounded-xl transition-all cursor-pointer text-sm disabled:opacity-60"
            >
              <Trash2 className="w-4.5 h-4.5" />
              Anular Documento
            </button>
          </div>
        </div>

        {/* VISOR DE FACTURA */}
        <div className="lg:col-span-2 space-y-6">
          <div className="relative bg-white text-zinc-900 rounded-2xl shadow-xl border-t-8 border-primary overflow-hidden p-8 sm:p-12 border border-zinc-200/60 font-sans leading-relaxed">
            {invoice.status === 'paid' && (
              <div className="absolute top-1/3 left-1/3 border-[6px] border-emerald-500/30 text-emerald-500/30 rounded-2xl font-black text-6xl tracking-widest p-6 uppercase -rotate-12 pointer-events-none select-none">
                PAGADO
              </div>
            )}

            {/* EMISOR */}
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between items-start border-b-2 border-zinc-250 pb-8">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-base shadow-sm">F</div>
                  <span className="text-xl font-bold tracking-tight text-zinc-950">{companySettings.companyName}</span>
                </div>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold max-w-[280px]">
                  {companySettings.giro}<br />
                  {companySettings.address}, {companySettings.city}<br />
                  {companySettings.phone}
                </p>
              </div>

              <div className="border-[3px] border-red-500 bg-white p-5 rounded-md text-center w-full sm:w-[240px] shrink-0 font-bold">
                <p className="text-red-500 font-mono text-sm tracking-wider">R.U.T. {companySettings.taxId}</p>
                <p className="text-red-500 uppercase font-bold text-xs my-2.5 tracking-tight leading-relaxed">Factura Electrónica</p>
                <p className="text-red-500 font-mono text-base">{invoice.number}</p>
              </div>
            </div>

            {/* FECHAS */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs border-b border-zinc-200 py-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-500 font-medium block">Fecha de Emisión</span>
                  <span className="font-bold text-zinc-850 block mt-0.5">{invoice.issue_date}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-500 font-medium block">Fecha de Vencimiento</span>
                  <span className="font-bold text-zinc-850 block mt-0.5">{invoice.due_date ?? '—'}</span>
                </div>
              </div>
            </div>

            {/* RECEPTOR */}
            <div className="py-6 border-b border-zinc-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Identificación del Receptor</h4>
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2">
                  <p><span className="text-zinc-500 font-medium">Señor(es):</span> <span className="font-bold text-zinc-950">{client?.name ?? '—'}</span></p>
                  <p><span className="text-zinc-500 font-medium">R.U.T.:</span> <span className="font-mono font-bold text-zinc-900">{client?.rut ?? '—'}</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-zinc-500 font-medium">Dirección:</span> <span className="font-semibold text-zinc-850">{client?.address ?? '—'}</span></p>
                  <p><span className="text-zinc-500 font-medium">Contacto:</span> <span className="text-primary font-semibold">{client?.email ?? '—'}</span></p>
                </div>
              </div>
            </div>

            {/* ITEMS */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-350 bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Descripción</th>
                    <th className="py-3 px-3 text-center">Cantidad</th>
                    <th className="py-3 px-3 text-right">Precio Unitario</th>
                    <th className="py-3 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-850 font-medium">
                  {items.length > 0 ? (
                    items.map((item) => (
                      <tr key={item.id}>
                        <td className="py-4 px-3 text-zinc-950 font-bold leading-normal max-w-[280px]">{item.description}</td>
                        <td className="py-4 px-3 text-center font-bold">{toNumber(item.quantity)}</td>
                        <td className="py-4 px-3 text-right">{money(item.unit_price)}</td>
                        <td className="py-4 px-3 text-right text-zinc-950 font-bold">{money(item.total)}</td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan={4} className="py-4 px-3 text-center text-zinc-400">Sin ítems registrados</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* TOTALES */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 border-t-2 border-zinc-250 pt-6">
              <div className="text-[10px] text-zinc-500 max-w-[340px] leading-relaxed">
                <p className="font-bold">Información de Ley:</p>
                <p className="mt-1">
                  Documento emitido conforme a la normativa de facturación electrónica de la República de Chile (Ley N° 19.983).
                </p>
              </div>

              <div className="w-full sm:w-[240px] text-xs font-semibold space-y-2 shrink-0">
                <div className="flex justify-between">
                  <span className="text-zinc-550">Monto Neto:</span>
                  <span className="text-zinc-900 font-bold">{money(invoice.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-zinc-550">I.V.A. ({toNumber(invoice.tax_rate)}%):</span>
                  <span className="text-zinc-900 font-bold">{money(invoice.tax_total)}</span>
                </div>
                <div className="h-px bg-zinc-200 my-1" />
                <div className="flex justify-between text-base text-zinc-950 font-black">
                  <span>Total CLP:</span>
                  <span>{money(invoice.total)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
