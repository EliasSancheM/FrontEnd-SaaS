'use client';

import React from 'react';
import { Building2, Hash, Globe, MapPin, Phone, User, Mail, Sparkles } from 'lucide-react';
import { FieldGroup, TextInput } from './FormFields';
import type { CompanySettings } from '@/lib/authStore';

interface CompanySectionProps {
  form: CompanySettings;
  updateForm: (key: keyof CompanySettings, value: string | number) => void;
  profileForm: { name: string; email: string };
  setProfileForm: React.Dispatch<React.SetStateAction<{ name: string; email: string }>>;
}

export default function CompanySection({ form, updateForm, profileForm, setProfileForm }: CompanySectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Building2 className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Identidad de la Empresa</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Información legal y de presentación</p>
          </div>
        </div>

        <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800">
          <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-black shadow-lg shadow-emerald-600/20 shrink-0">
            {form.companyName ? form.companyName.charAt(0).toUpperCase() : 'E'}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Logo de la Empresa</p>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">PNG, JPG o SVG. Máximo 2MB. Recomendado: 256×256px.</p>
            <button className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 text-xs font-semibold text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-700 transition-colors">
              <Sparkles className="w-3 h-3" />
              Subir Logo
            </button>
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <FieldGroup label="Razón Social" description="Nombre legal de la empresa">
            <TextInput value={form.companyName} onChange={(v) => updateForm('companyName', v)} placeholder="Mi Empresa SpA" icon={Building2} />
          </FieldGroup>
          <FieldGroup label="RUT de la Empresa" description="Rol Único Tributario">
            <TextInput value={form.taxId} onChange={(v) => updateForm('taxId', v)} placeholder="76.543.210-9" icon={Hash} />
          </FieldGroup>
          <FieldGroup label="Giro Comercial" description="Actividad económica principal">
            <TextInput value={form.giro} onChange={(v) => updateForm('giro', v)} placeholder="Servicios de Software" icon={Globe} />
          </FieldGroup>
          <FieldGroup label="Sitio Web">
            <TextInput value={form.website} onChange={(v) => updateForm('website', v)} placeholder="https://tuempresa.cl" icon={Globe} />
          </FieldGroup>
          <FieldGroup label="Dirección">
            <TextInput value={form.address} onChange={(v) => updateForm('address', v)} placeholder="Av. Providencia 1234" icon={MapPin} />
          </FieldGroup>
          <FieldGroup label="Ciudad">
            <TextInput value={form.city} onChange={(v) => updateForm('city', v)} placeholder="Santiago, Chile" icon={MapPin} />
          </FieldGroup>
          <FieldGroup label="Teléfono">
            <TextInput value={form.phone} onChange={(v) => updateForm('phone', v)} placeholder="+56 2 2345 6789" icon={Phone} />
          </FieldGroup>
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-blue-500/10">
            <User className="w-5 h-5 text-blue-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Perfil Personal</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Tu información de usuario administrador</p>
          </div>
        </div>
        <div className="grid gap-5 sm:grid-cols-2">
          <FieldGroup label="Nombre Completo">
            <TextInput value={profileForm.name} onChange={(v) => setProfileForm(p => ({ ...p, name: v }))} placeholder="Tu nombre" icon={User} />
          </FieldGroup>
          <FieldGroup label="Correo Electrónico">
            <TextInput value={profileForm.email} onChange={(v) => setProfileForm(p => ({ ...p, email: v }))} placeholder="tu@email.cl" icon={Mail} type="email" />
          </FieldGroup>
        </div>
      </div>
    </div>
  );
}
