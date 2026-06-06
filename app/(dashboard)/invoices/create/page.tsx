'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  ArrowLeft,
  Plus,
  Trash2,
  Sparkles,
  Check,
  FileText,
  User,
  PlusCircle,
  X,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useClients, useCreateClient } from '@/lib/clients';
import { useInvoices, useCreateInvoice } from '@/lib/invoices';
import { useAuthStore } from '@/lib/authStore';
import { money } from '@/lib/format';

const TAX_RATE = 19; // IVA Chile

const invoiceSchema = z.object({
  clientId: z.string().min(1, 'Por favor, selecciona un cliente'),
  number: z.string().min(3, 'El número de factura es requerido'),
  issueDate: z.string().min(1, 'La fecha de emisión es requerida'),
  dueDate: z.string().min(1, 'La fecha de vencimiento es requerida'),
  items: z
    .array(
      z.object({
        description: z.string().min(1, 'La descripción es requerida'),
        quantity: z.number().min(0.01, 'Mínimo 0.01'),
        unitPrice: z.number().min(1, 'Mínimo $1'),
      })
    )
    .min(1, 'Debes agregar al menos un ítem o concepto'),
});

type InvoiceFormValues = z.infer<typeof invoiceSchema>;

const toastStyle = {
  style: {
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
  },
};

export default function CreateInvoicePage() {
  const router = useRouter();
  const { data: clients = [] } = useClients();
  const { data: invoices = [] } = useInvoices();
  const createClient = useCreateClient();
  const createInvoice = useCreateInvoice();
  const { companySettings, user } = useAuthStore();

  const [isQuickClientOpen, setIsQuickClientOpen] = useState(false);
  const [quickClientName, setQuickClientName] = useState('');
  const [quickClientRut, setQuickClientRut] = useState('');
  const [quickClientEmail, setQuickClientEmail] = useState('');

  const prefix = companySettings.invoicePrefix || 'FAC';
  const nextInvoiceNumber = `${prefix}-${String(invoices.length + (companySettings.nextFolioNumber || 1)).padStart(4, '0')}`;

  const {
    register,
    control,
    watch,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceSchema),
    defaultValues: {
      clientId: '',
      number: nextInvoiceNumber,
      issueDate: new Date().toISOString().split('T')[0],
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      items: [{ description: '', quantity: 1, unitPrice: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  const watchedClientId = watch('clientId');
  const watchedNumber = watch('number');
  const watchedIssueDate = watch('issueDate');
  const watchedDueDate = watch('dueDate');
  const watchedItems = watch('items') || [];

  const selectedClient = clients.find((c) => String(c.id) === watchedClientId);

  const subtotal = watchedItems.reduce((sum, item) => {
    const qty = Number(item.quantity) || 0;
    const price = Number(item.unitPrice) || 0;
    return sum + qty * price;
  }, 0);
  const taxAmount = subtotal * (TAX_RATE / 100);
  const totalAmount = subtotal + taxAmount;

  const handleQuickClientSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quickClientName || !quickClientRut || !quickClientEmail) {
      toast.error('Completa los campos obligatorios del cliente rápido', toastStyle);
      return;
    }

    createClient.mutate(
      {
        name: quickClientName,
        rut: quickClientRut,
        email: quickClientEmail,
        status: 'active',
      },
      {
        onSuccess: (newClient) => {
          setValue('clientId', String(newClient.id));
          setIsQuickClientOpen(false);
          setQuickClientName('');
          setQuickClientRut('');
          setQuickClientEmail('');
          toast.success(`Cliente "${newClient.name}" registrado e incorporado.`, { icon: '👤', ...toastStyle });
        },
        onError: () => toast.error('No se pudo registrar el cliente rápido', toastStyle),
      }
    );
  };

  const onSubmit = (data: InvoiceFormValues) => {
    createInvoice.mutate(
      {
        client_id: Number(data.clientId),
        number: data.number,
        issue_date: data.issueDate,
        due_date: data.dueDate,
        status: 'sent',
        currency: 'CLP',
        tax_rate: TAX_RATE,
        items: data.items.map((it) => ({
          description: it.description,
          quantity: it.quantity,
          unit_price: it.unitPrice,
        })),
      },
      {
        onSuccess: (invoice) => {
          toast.success(`Factura ${invoice.number} emitida exitosamente.`, { icon: '🚀', duration: 3000, ...toastStyle });
          setTimeout(() => router.push('/invoices'), 1000);
        },
        onError: (error) => {
          const msg = isAxiosError(error) && error.response?.status === 422
            ? 'Revisa los datos: el número de factura podría estar repetido.'
            : 'No se pudo emitir la factura.';
          toast.error(msg, toastStyle);
        },
      }
    );
  };

  const isSubmitting = createInvoice.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-500 pb-12">
      <Toaster position="top-right" />

      {/* ENCABEZADO Y REGRESO */}
      <div className="flex flex-col gap-3">
        <Link
          href="/invoices"
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white transition-colors w-fit"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Facturas
        </Link>
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
            Emitir Nueva Factura
            <Sparkles className="w-6 h-6 text-primary animate-pulse" />
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400">
            Formulario dinámico con cálculo de IVA automático. Los totales se calculan y guardan en el servidor.
          </p>
        </div>
      </div>

      <div className="grid gap-8 lg:grid-cols-12 items-start">
        {/* PANEL IZQUIERDO: FORMULARIO */}
        <form onSubmit={handleSubmit(onSubmit)} className="lg:col-span-7 space-y-6">
          {/* SECCIÓN 1: DATOS CABECERA */}
          <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-150 dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-5">
            <h3 className="text-base font-bold text-zinc-900 dark:text-white border-b border-zinc-50 dark:border-zinc-900/50 pb-3 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" />
              Información de la Transacción
            </h3>

            <div className="grid gap-5 sm:grid-cols-2">
              {/* Selección de Cliente */}
              <div className="sm:col-span-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                    Cliente Receptor
                  </label>
                  <button
                    type="button"
                    onClick={() => setIsQuickClientOpen(!isQuickClientOpen)}
                    className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    + Cliente rápido
                  </button>
                </div>

                {isQuickClientOpen && (
                  <div className="mb-4 p-4 rounded-xl border border-dashed border-primary/30 bg-primary/5 space-y-3 animate-in slide-in-from-top duration-300">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-extrabold text-primary uppercase">Nuevo Cliente Express</span>
                      <button type="button" onClick={() => setIsQuickClientOpen(false)} className="text-zinc-400 hover:text-zinc-700 dark:hover:text-white">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <input
                        type="text"
                        placeholder="Razón Social / Nombre"
                        value={quickClientName}
                        onChange={(e) => setQuickClientName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                      <input
                        type="text"
                        placeholder="RUT / ID Fiscal"
                        value={quickClientRut}
                        onChange={(e) => setQuickClientRut(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                      <input
                        type="email"
                        placeholder="Correo Facturación"
                        value={quickClientEmail}
                        onChange={(e) => setQuickClientEmail(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-xs text-zinc-900 dark:text-white outline-none"
                      />
                    </div>
                    <div className="flex justify-end">
                      <button
                        type="button"
                        onClick={handleQuickClientSubmit}
                        disabled={createClient.isPending}
                        className="px-3.5 py-1.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary/90 transition-all shadow-sm disabled:opacity-60 inline-flex items-center gap-1.5"
                      >
                        {createClient.isPending && <Loader2 className="w-3 h-3 animate-spin" />}
                        Agregar y Seleccionar
                      </button>
                    </div>
                  </div>
                )}

                <select
                  {...register('clientId')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 focus:bg-white dark:bg-zinc-900/30 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                    ${errors.clientId ? 'border-red-500 focus:ring-red-200' : 'border-zinc-250 dark:border-zinc-800'}
                  `}
                >
                  <option value="">-- Selecciona un cliente registrado --</option>
                  {clients.map((client) => (
                    <option key={client.id} value={String(client.id)}>
                      {client.name}{client.rut ? ` (${client.rut})` : ''}
                    </option>
                  ))}
                </select>
                {errors.clientId && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.clientId.message}
                  </p>
                )}
              </div>

              {/* Número de Factura */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Folio / Código Factura
                </label>
                <input
                  type="text"
                  {...register('number')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 focus:bg-white dark:bg-zinc-900/30 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm font-semibold
                    ${errors.number ? 'border-red-500 focus:ring-red-200' : 'border-zinc-250 dark:border-zinc-800'}
                  `}
                />
                {errors.number && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.number.message}
                  </p>
                )}
              </div>

              {/* Fecha Emisión */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Fecha de Emisión
                </label>
                <input
                  type="date"
                  {...register('issueDate')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 focus:bg-white dark:bg-zinc-900/30 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                    ${errors.issueDate ? 'border-red-500 focus:ring-red-200' : 'border-zinc-250 dark:border-zinc-800'}
                  `}
                />
                {errors.issueDate && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.issueDate.message}
                  </p>
                )}
              </div>

              {/* Fecha Vencimiento */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                  Vencimiento del Pago
                </label>
                <input
                  type="date"
                  {...register('dueDate')}
                  className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 focus:bg-white dark:bg-zinc-900/30 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                    ${errors.dueDate ? 'border-red-500 focus:ring-red-200' : 'border-zinc-250 dark:border-zinc-800'}
                  `}
                />
                {errors.dueDate && (
                  <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                    <AlertCircle className="w-3.5 h-3.5" />
                    {errors.dueDate.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* SECCIÓN 2: ITEMS */}
          <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-150 dark:border-zinc-900 rounded-2xl p-6 shadow-sm space-y-5">
            <div className="flex items-center justify-between border-b border-zinc-50 dark:border-zinc-900/50 pb-3">
              <h3 className="text-base font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                <FileText className="w-5 h-5 text-primary" />
                Ítems / Desglose de Servicios
              </h3>
              <span className="text-xs font-semibold px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 rounded-lg">
                {fields.length} {fields.length === 1 ? 'ítem' : 'ítems'}
              </span>
            </div>

            <div className="space-y-4">
              {fields.map((field, index) => (
                <div
                  key={field.id}
                  className="flex flex-col sm:flex-row gap-3 items-start sm:items-center bg-zinc-50/50 dark:bg-zinc-900/10 p-4 rounded-xl border border-zinc-100 dark:border-zinc-900 relative group animate-in slide-in-from-bottom-2 duration-300"
                >
                  <div className="flex-1 w-full">
                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 dark:text-zinc-500 mb-1.5 sm:hidden">
                      Descripción
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Servicio de consultoría..."
                      {...register(`items.${index}.description`)}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="w-full sm:w-20">
                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 dark:text-zinc-500 mb-1.5 sm:hidden">
                      Cant.
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="1"
                      {...register(`items.${index}.quantity`, { valueAsNumber: true })}
                      className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white text-center outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                    />
                  </div>

                  <div className="w-full sm:w-32">
                    <label className="block text-[10px] font-extrabold uppercase text-zinc-400 dark:text-zinc-500 mb-1.5 sm:hidden">
                      Precio Unitario
                    </label>
                    <div className="relative">
                      <span className="absolute inset-y-0 left-2.5 flex items-center text-zinc-400 text-xs pointer-events-none">$</span>
                      <input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                        className="w-full pl-6 pr-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm text-zinc-900 dark:text-white outline-none focus:ring-1 focus:ring-primary focus:border-primary transition-all"
                      />
                    </div>
                  </div>

                  {fields.length > 1 && (
                    <button
                      type="button"
                      onClick={() => {
                        remove(index);
                        toast.error('Concepto eliminado del desglose', toastStyle);
                      }}
                      className="p-2.5 text-zinc-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/20 rounded-lg transition-all shrink-0 self-end sm:self-center"
                      title="Eliminar Concepto"
                    >
                      <Trash2 className="w-4.5 h-4.5" />
                    </button>
                  )}
                </div>
              ))}

              <button
                type="button"
                onClick={() => {
                  append({ description: '', quantity: 1, unitPrice: 0 });
                  toast.success('Concepto adicionado con éxito', toastStyle);
                }}
                className="w-full py-3.5 border border-dashed border-zinc-200 hover:border-primary dark:border-zinc-800 dark:hover:border-primary/60 text-zinc-550 dark:text-zinc-400 hover:text-primary rounded-xl flex items-center justify-center gap-2 hover:bg-zinc-50 dark:hover:bg-zinc-900/20 font-bold text-xs transition-all mt-2 cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                Añadir Concepto / Ítem de Cobro
              </button>
            </div>
          </div>

          {/* ACCIONES */}
          <div className="flex items-center justify-end gap-4 p-2">
            <Link
              href="/invoices"
              className="px-5 py-3 rounded-xl border border-zinc-250 hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-350 dark:hover:bg-zinc-900/60 font-bold text-sm transition-all"
            >
              Cancelar
            </Link>
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 flex items-center gap-2 cursor-pointer disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : <Check className="w-5 h-5" />}
              Emitir Factura Electrónica
            </button>
          </div>
        </form>

        {/* PANEL DERECHO: PREVIEW EN VIVO */}
        <div className="lg:col-span-5 lg:sticky lg:top-24 space-y-6">
          <div className="bg-zinc-100 dark:bg-zinc-950 p-2 rounded-2xl border border-zinc-200 dark:border-zinc-900">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest px-4 py-2 block text-center">
              Previsualización (En Vivo)
            </span>

            <div className="bg-white text-zinc-800 dark:bg-white p-6 sm:p-8 rounded-xl shadow-lg border border-zinc-200/60 max-w-full overflow-hidden text-left relative aspect-[1/1.4] flex flex-col justify-between select-none">
              <div>
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4 pb-6 border-b border-zinc-150">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5 text-emerald-700 font-extrabold text-lg tracking-tight uppercase">
                      <Sparkles className="w-5 h-5 text-emerald-600" />
                      {companySettings.companyName}
                    </div>
                    <p className="text-[9px] font-semibold text-zinc-450 leading-relaxed uppercase">
                      {companySettings.giro}<br />
                      {companySettings.address}, {companySettings.city}<br />
                      Fono: {companySettings.phone} | {user?.email || ''}
                    </p>
                  </div>

                  <div className="border-2 border-red-500 text-red-500 rounded p-3 text-center min-w-[150px] shrink-0">
                    <span className="text-[9px] font-bold block leading-none uppercase">R.U.T.: {companySettings.taxId}</span>
                    <span className="text-[10px] font-extrabold block my-1 uppercase">FACTURA ELECTRÓNICA</span>
                    <span className="text-[11px] font-black block leading-none">{watchedNumber || 'FAC-XXXX'}</span>
                    <span className="text-[6px] font-extrabold block text-zinc-400 mt-1 uppercase">{companySettings.siiResolution || 'S.I.I.'}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 py-5 text-[10px] border-b border-zinc-150">
                  <div className="space-y-1.5">
                    <span className="font-extrabold text-zinc-400 uppercase tracking-wide block">Señor(es):</span>
                    <h5 className="font-bold text-zinc-900 truncate uppercase">
                      {selectedClient ? selectedClient.name : '__________________________________'}
                    </h5>
                    <div className="text-zinc-500 font-medium leading-normal">
                      {selectedClient ? (
                        <>
                          RUT: {selectedClient.rut || '—'}<br />
                          Correo: {selectedClient.email || '—'}<br />
                          Dirección: {selectedClient.address || '—'}
                        </>
                      ) : (
                        <>
                          RUT: ____________________<br />
                          Correo: ____________________<br />
                          Dirección: ____________________
                        </>
                      )}
                    </div>
                  </div>

                  <div className="space-y-1.5 pl-4 border-l border-zinc-100">
                    <span className="font-extrabold text-zinc-400 uppercase tracking-wide block">Información Fiscal:</span>
                    <div className="text-zinc-500 font-medium space-y-1">
                      <div><strong className="text-zinc-650 font-bold uppercase">Emisión:</strong> {watchedIssueDate || '—'}</div>
                      <div><strong className="text-zinc-650 font-bold uppercase">Vencimiento:</strong> {watchedDueDate || '—'}</div>
                      <div><strong className="text-zinc-650 font-bold uppercase">Moneda:</strong> CLP (Pesos Chilenos)</div>
                    </div>
                  </div>
                </div>

                <div className="py-4 overflow-hidden">
                  <table className="w-full text-left text-[9px] border-collapse">
                    <thead>
                      <tr className="border-b border-zinc-200 text-zinc-400 font-bold uppercase tracking-wider">
                        <th className="pb-1.5">Detalle Concepto</th>
                        <th className="pb-1.5 text-center w-12">Cant.</th>
                        <th className="pb-1.5 text-right w-20">P. Unitario</th>
                        <th className="pb-1.5 text-right w-24">Valor Neto</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-100 text-zinc-700 font-medium">
                      {watchedItems.map((item, idx) => {
                        const q = Number(item.quantity) || 0;
                        const p = Number(item.unitPrice) || 0;
                        return (
                          <tr key={idx} className="hover:bg-zinc-50/50">
                            <td className="py-2.5 pr-2 truncate max-w-[150px] text-zinc-900 font-semibold uppercase">
                              {item.description || 'Detalle del concepto...'}
                            </td>
                            <td className="py-2.5 text-center">{q}</td>
                            <td className="py-2.5 text-right">{money(p)}</td>
                            <td className="py-2.5 text-right text-zinc-900 font-bold">{money(q * p)}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="border-t border-zinc-200 pt-4 mt-6">
                <div className="w-full sm:w-1/2 ml-auto space-y-1.5 text-[10px]">
                  <div className="flex justify-between items-center text-zinc-500 font-medium">
                    <span className="uppercase">Subtotal Neto:</span>
                    <span className="font-bold text-zinc-800">{money(subtotal)}</span>
                  </div>
                  <div className="flex justify-between items-center text-zinc-500 font-medium">
                    <span className="uppercase">IVA ({TAX_RATE}%):</span>
                    <span className="font-bold text-zinc-800">{money(taxAmount)}</span>
                  </div>
                  <div className="h-px bg-zinc-200 my-1" />
                  <div className="flex justify-between items-center text-[12px] font-extrabold text-emerald-700">
                    <span className="uppercase font-black">TOTAL CLP:</span>
                    <span className="text-sm font-black">{money(totalAmount)}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-6 pt-4 border-t border-dashed border-zinc-150">
                  <div className="flex items-center gap-1 opacity-20">
                    <Sparkles className="w-5 h-5 text-emerald-800" />
                    <span className="text-[7px] font-black tracking-widest text-zinc-900 uppercase">{companySettings.companyName}</span>
                  </div>
                  <span className="text-[7px] px-2 py-0.5 border border-zinc-300 rounded text-zinc-400 font-bold tracking-wider uppercase">
                    Documento Borrador
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
