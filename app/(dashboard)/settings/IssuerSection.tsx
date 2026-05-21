'use client';

import React from 'react';
import { Shield, FileText, Calendar, Globe, Check } from 'lucide-react';
import { FieldGroup, TextInput } from './FormFields';
import type { CompanySettings } from '@/lib/authStore';

interface IssuerSectionProps {
  form: CompanySettings;
  updateForm: (key: keyof CompanySettings, value: string | number) => void;
}

export default function IssuerSection({ form, updateForm }: IssuerSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-violet-500/10">
            <Shield className="w-5 h-5 text-violet-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Configuración SII</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Datos requeridos para la emisión de DTEs electrónicos</p>
          </div>
        </div>

        <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
            <Check className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Conexión SII Activa</p>
            <p className="text-xs text-emerald-600/70 dark:text-emerald-500/60">Tu empresa está habilitada para emitir Facturas Electrónicas (DTE).</p>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldGroup label="Resolución Exenta" description="Número de resolución SII que autoriza la emisión electrónica">
            <TextInput value={form.siiResolution} onChange={(v) => updateForm('siiResolution', v)} placeholder="Resolución Exenta SII N° 80" icon={FileText} />
          </FieldGroup>
          <FieldGroup label="Fecha de Resolución">
            <TextInput value={form.siiResolutionDate} onChange={(v) => updateForm('siiResolutionDate', v)} type="date" icon={Calendar} />
          </FieldGroup>
          <div className="sm:col-span-2">
            <FieldGroup label="Actividad Económica SII" description="Código y descripción de la actividad registrada ante el SII">
              <TextInput value={form.siiActivity} onChange={(v) => updateForm('siiActivity', v)} placeholder="Servicios de Procesamiento de Datos" icon={Globe} />
            </FieldGroup>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-br from-violet-600 to-indigo-800 text-white rounded-2xl p-6 shadow-md shadow-violet-700/10 relative overflow-hidden">
        <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
          <Shield className="w-40 h-40" />
        </div>
        <div className="relative z-10">
          <span className="text-xs font-bold uppercase tracking-widest text-violet-200 bg-white/10 px-2.5 py-1 rounded-full">Certificado Digital</span>
          <h4 className="text-xl font-bold mt-4">Firma Electrónica Avanzada</h4>
          <p className="text-sm text-violet-100/90 mt-2 font-medium leading-relaxed">Para emitir documentos tributarios electrónicos se requiere un certificado digital vigente emitido por una entidad certificadora acreditada (e-Sign, CertificaChile, etc.).</p>
          <div className="mt-5 flex items-center gap-3">
            <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
              <div className="h-full w-3/4 bg-white/80 rounded-full" />
            </div>
            <span className="text-xs font-bold text-violet-200">Vigente · 278 días</span>
          </div>
        </div>
      </div>
    </div>
  );
}
