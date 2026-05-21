'use client';

import React from 'react';
import { Receipt, DollarSign, Percent, Hash, Calendar, StickyNote, FileText } from 'lucide-react';
import { FieldGroup, TextInput, TextAreaInput } from './FormFields';
import type { CompanySettings } from '@/lib/authStore';

const currencies = [
  { code: 'CLP', name: 'Peso Chileno ($)', symbol: '$' },
  { code: 'USD', name: 'Dólar USA (US$)', symbol: 'US$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'UF', name: 'Unidad de Fomento (UF)', symbol: 'UF' },
];

interface BillingSectionProps {
  form: CompanySettings;
  updateForm: (key: keyof CompanySettings, value: string | number) => void;
}

export default function BillingSection({ form, updateForm }: BillingSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-amber-500/10">
            <Receipt className="w-5 h-5 text-amber-600 dark:text-amber-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Preferencias de Facturación</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Moneda, impuestos y configuración de numeración</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldGroup label="Moneda Predeterminada" description="Divisa principal para las facturas">
            <div className="relative">
              <DollarSign className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 dark:text-zinc-500 pointer-events-none" />
              <select
                value={form.currency}
                onChange={(e) => updateForm('currency', e.target.value)}
                className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/50 text-sm text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all duration-200 pl-10 pr-4 py-3 appearance-none cursor-pointer"
              >
                {currencies.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </FieldGroup>
          <FieldGroup label="Tasa de IVA (%)" description="Impuesto al valor agregado aplicable">
            <TextInput value={String(form.vatRate)} onChange={(v) => updateForm('vatRate', Number(v) || 0)} placeholder="19" icon={Percent} type="number" />
          </FieldGroup>
          <FieldGroup label="Prefijo de Factura" description="Identificador previo a la numeración (ej. FAC, INV)">
            <TextInput value={form.invoicePrefix} onChange={(v) => updateForm('invoicePrefix', v)} placeholder="FAC" icon={Hash} />
          </FieldGroup>
          <FieldGroup label="Próximo Folio" description="Número consecutivo de la próxima factura">
            <TextInput value={String(form.nextFolioNumber)} onChange={(v) => updateForm('nextFolioNumber', Number(v) || 1)} placeholder="25" icon={Hash} type="number" />
          </FieldGroup>
          <FieldGroup label="Plazo de Pago (días)" description="Días por defecto para el vencimiento de la factura">
            <TextInput value={String(form.defaultPaymentTermsDays)} onChange={(v) => updateForm('defaultPaymentTermsDays', Number(v) || 30)} placeholder="30" icon={Calendar} type="number" />
          </FieldGroup>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-sky-500/10">
            <StickyNote className="w-5 h-5 text-sky-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Notas por Defecto</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Texto que aparece al pie de cada factura generada</p>
          </div>
        </div>
        <FieldGroup label="Texto Legal / Instrucciones de Pago">
          <TextAreaInput value={form.defaultNotes} onChange={(v) => updateForm('defaultNotes', v)} placeholder="Pago mediante transferencia bancaria..." rows={4} />
        </FieldGroup>
      </div>
      
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2.5 rounded-xl bg-zinc-100 dark:bg-zinc-800">
            <FileText className="w-5 h-5 text-zinc-600 dark:text-zinc-400" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Vista Previa del Folio</h3>
        </div>
        <div className="flex items-center gap-4 p-5 rounded-xl bg-zinc-50 dark:bg-zinc-900/40 border border-zinc-100 dark:border-zinc-800">
          <div className="text-center">
            <p className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider mb-1">Próxima Factura</p>
            <p className="text-3xl font-black tracking-tight text-zinc-900 dark:text-white">
              {form.invoicePrefix}-{String(form.nextFolioNumber).padStart(4, '0')}
            </p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1">
              {currencies.find(c => c.code === form.currency)?.symbol || '$'} · IVA {form.vatRate}% · {form.defaultPaymentTermsDays} días plazo
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
