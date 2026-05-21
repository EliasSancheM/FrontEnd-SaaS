'use client';

import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/lib/authStore';
import { useSaaSStore } from '@/lib/store';
import toast from 'react-hot-toast';
import {
  Building2,
  FileText,
  Receipt,
  Palette,
  AlertTriangle,
  Save,
  RotateCcw,
  Trash2,
  Check,
  ChevronRight,
  Shield,
  Globe,
  Phone,
  Mail,
  MapPin,
  Hash,
  Calendar,
  DollarSign,
  Percent,
  StickyNote,
  Sun,
  Moon,
  Monitor,
  User,
  Sparkles,
  CircleAlert,
  Loader2
} from 'lucide-react';

type SettingsSection = 'company' | 'issuer' | 'billing' | 'appearance' | 'danger';

interface SectionNavItem {
  id: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}

const sections: SectionNavItem[] = [
  { id: 'company', label: 'Perfil de Empresa', icon: Building2, description: 'Datos legales y de contacto' },
  { id: 'issuer', label: 'Datos del Emisor', icon: FileText, description: 'Configuración SII y emisión' },
  { id: 'billing', label: 'Facturación', icon: Receipt, description: 'Moneda, IVA y folios' },
  { id: 'appearance', label: 'Apariencia', icon: Palette, description: 'Tema y colores' },
  { id: 'danger', label: 'Zona de Peligro', icon: AlertTriangle, description: 'Acciones destructivas' },
];

const accentColors = [
  { id: 'emerald' as const, label: 'Esmeralda', class: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  { id: 'blue' as const, label: 'Azul', class: 'bg-blue-500', ring: 'ring-blue-500/30' },
  { id: 'violet' as const, label: 'Violeta', class: 'bg-violet-500', ring: 'ring-violet-500/30' },
  { id: 'amber' as const, label: 'Ámbar', class: 'bg-amber-500', ring: 'ring-amber-500/30' },
  { id: 'rose' as const, label: 'Rosa', class: 'bg-rose-500', ring: 'ring-rose-500/30' },
];

const currencies = [
  { code: 'CLP', name: 'Peso Chileno ($)', symbol: '$' },
  { code: 'USD', name: 'Dólar USA (US$)', symbol: 'US$' },
  { code: 'EUR', name: 'Euro (€)', symbol: '€' },
  { code: 'UF', name: 'Unidad de Fomento (UF)', symbol: 'UF' },
];

// --- Reusable Field Components ---

function FieldGroup({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {description && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
      )}
      <div className="mt-1">{children}</div>
    </div>
  );
}

function TextInput({ 
  value, onChange, placeholder, icon: Icon, type = 'text', disabled = false 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-primary transition-colors" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full rounded-xl border border-zinc-200 dark:border-zinc-800 
          bg-zinc-50/50 dark:bg-zinc-900/50 
          text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
        `}
      />
    </div>
  );
}

function TextAreaInput({ 
  value, onChange, placeholder, rows = 3 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-xl border border-zinc-200 dark:border-zinc-800 
        bg-zinc-50/50 dark:bg-zinc-900/50 
        text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        transition-all duration-200 px-4 py-3 resize-none
      "
    />
  );
}

export default function SettingsPage() {
  const { user, companySettings, updateProfile, updateCompanySettings, resetCompanySettings } = useAuthStore();
  const saasStore = useSaaSStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('company');
  const [isSaving, setIsSaving] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  // Local form state for company settings
  const [form, setForm] = useState(companySettings);
  const [profileForm, setProfileForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
  });

  useEffect(() => {
    saasStore.initialize();
  }, [saasStore.initialize]);

  useEffect(() => {
    setForm(companySettings);
  }, [companySettings]);

  useEffect(() => {
    if (user) {
      setProfileForm({ name: user.name, email: user.email });
    }
  }, [user]);

  const handleSaveCompanyProfile = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 600));
    
    updateCompanySettings(form);
    updateProfile({ 
      name: profileForm.name, 
      email: profileForm.email,
      company: form.companyName 
    });
    
    setIsSaving(false);
    toast.success('Configuración guardada exitosamente', {
      icon: '✅',
      style: { 
        background: '#0e0e0e', 
        color: '#fff', 
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px'
      },
    });
  };

  const handleResetSettings = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 400));
    resetCompanySettings();
    setShowResetConfirm(false);
    setIsSaving(false);
    toast.success('Configuración restaurada a valores predeterminados', {
      icon: '🔄',
      style: { 
        background: '#0e0e0e', 
        color: '#fff', 
        border: '1px solid rgba(251,191,36,0.2)',
        borderRadius: '12px'
      },
    });
  };

  const handleWipeData = async () => {
    setIsSaving(true);
    await new Promise(resolve => setTimeout(resolve, 800));
    
    if (typeof window !== 'undefined') {
      localStorage.removeItem('saas_clients');
      localStorage.removeItem('saas_invoices');
    }
    
    setShowWipeConfirm(false);
    setIsSaving(false);
    toast.success('Todos los datos de negocio han sido eliminados. Recarga la página.', {
      icon: '🗑️',
      duration: 5000,
      style: { 
        background: '#0e0e0e', 
        color: '#fff', 
        border: '1px solid rgba(239,68,68,0.3)',
        borderRadius: '12px'
      },
    });
  };

  const updateForm = (key: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* HEADER */}
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Configuración
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Administra los datos de tu empresa, preferencias de facturación y personalización visual.
          </p>
        </div>
        <button
          onClick={handleSaveCompanyProfile}
          disabled={isSaving}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
        >
          {isSaving ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          {isSaving ? 'Guardando...' : 'Guardar Cambios'}
        </button>
      </div>

      {/* LAYOUT: SIDEBAR NAV + CONTENT */}
      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">

        {/* SETTINGS NAVIGATION */}
        <nav className="space-y-1.5">
          {sections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            const isDanger = section.id === 'danger';
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`
                  flex items-center gap-3.5 w-full px-4 py-3.5 rounded-xl text-left transition-all duration-200 group
                  ${isActive 
                    ? isDanger
                      ? 'bg-red-500/10 border border-red-500/20 text-red-600 dark:text-red-400'
                      : 'bg-primary/10 border border-primary/20 text-primary'
                    : 'hover:bg-zinc-50 dark:hover:bg-zinc-900/60 text-zinc-600 dark:text-zinc-400 border border-transparent'
                  }
                `}
              >
                <div className={`
                  p-2 rounded-lg transition-colors
                  ${isActive 
                    ? isDanger 
                      ? 'bg-red-500/10' 
                      : 'bg-primary/10' 
                    : 'bg-zinc-100 dark:bg-zinc-800/50 group-hover:bg-zinc-200/80 dark:group-hover:bg-zinc-800'
                  }
                `}>
                  <Icon className={`w-4 h-4 ${isActive ? '' : 'text-zinc-500 dark:text-zinc-400'}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className={`text-sm font-semibold ${isActive ? '' : 'text-zinc-700 dark:text-zinc-300'}`}>
                    {section.label}
                  </p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 truncate">
                    {section.description}
                  </p>
                </div>
                <ChevronRight className={`w-4 h-4 transition-transform ${isActive ? 'rotate-90' : ''} ${isActive ? '' : 'opacity-0 group-hover:opacity-50'}`} />
              </button>
            );
          })}
        </nav>

        {/* SETTINGS CONTENT */}
        <div className="min-w-0">

          {/* =================== PERFIL DE EMPRESA =================== */}
          {activeSection === 'company' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Company Logo & Identity Card */}
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

                {/* Logo upload area */}
                <div className="flex items-center gap-6 mb-8 p-4 rounded-xl bg-zinc-50/80 dark:bg-zinc-900/30 border border-dashed border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl font-black shadow-lg shadow-emerald-600/20 shrink-0">
                    {form.companyName ? form.companyName.charAt(0).toUpperCase() : 'E'}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Logo de la Empresa</p>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                      PNG, JPG o SVG. Máximo 2MB. Recomendado: 256×256px.
                    </p>
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

              {/* Personal Profile */}
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
          )}

          {/* =================== DATOS DEL EMISOR =================== */}
          {activeSection === 'issuer' && (
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

                {/* SII status badge */}
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-500/5 border border-emerald-500/10 mb-6">
                  <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-emerald-500/10">
                    <Check className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm font-bold text-emerald-700 dark:text-emerald-400">Conexión SII Activa</p>
                    <p className="text-xs text-emerald-600/70 dark:text-emerald-500/60">
                      Tu empresa está habilitada para emitir Facturas Electrónicas (DTE).
                    </p>
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

              {/* Certificate info card */}
              <div className="bg-gradient-to-br from-violet-600 to-indigo-800 text-white rounded-2xl p-6 shadow-md shadow-violet-700/10 relative overflow-hidden">
                <div className="absolute right-0 bottom-0 opacity-10 translate-y-6 translate-x-6">
                  <Shield className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                  <span className="text-xs font-bold uppercase tracking-widest text-violet-200 bg-white/10 px-2.5 py-1 rounded-full">
                    Certificado Digital
                  </span>
                  <h4 className="text-xl font-bold mt-4">Firma Electrónica Avanzada</h4>
                  <p className="text-sm text-violet-100/90 mt-2 font-medium leading-relaxed">
                    Para emitir documentos tributarios electrónicos se requiere un certificado digital vigente emitido por una entidad certificadora acreditada (e-Sign, CertificaChile, etc.).
                  </p>
                  <div className="mt-5 flex items-center gap-3">
                    <div className="h-2 flex-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full w-3/4 bg-white/80 rounded-full" />
                    </div>
                    <span className="text-xs font-bold text-violet-200">Vigente · 278 días</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* =================== FACTURACIÓN =================== */}
          {activeSection === 'billing' && (
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
                    <TextInput 
                      value={String(form.vatRate)} 
                      onChange={(v) => updateForm('vatRate', Number(v) || 0)} 
                      placeholder="19" 
                      icon={Percent} 
                      type="number" 
                    />
                  </FieldGroup>

                  <FieldGroup label="Prefijo de Factura" description="Identificador previo a la numeración (ej. FAC, INV)">
                    <TextInput value={form.invoicePrefix} onChange={(v) => updateForm('invoicePrefix', v)} placeholder="FAC" icon={Hash} />
                  </FieldGroup>

                  <FieldGroup label="Próximo Folio" description="Número consecutivo de la próxima factura">
                    <TextInput 
                      value={String(form.nextFolioNumber)} 
                      onChange={(v) => updateForm('nextFolioNumber', Number(v) || 1)} 
                      placeholder="25" 
                      icon={Hash} 
                      type="number" 
                    />
                  </FieldGroup>

                  <FieldGroup label="Plazo de Pago (días)" description="Días por defecto para el vencimiento de la factura">
                    <TextInput 
                      value={String(form.defaultPaymentTermsDays)} 
                      onChange={(v) => updateForm('defaultPaymentTermsDays', Number(v) || 30)} 
                      placeholder="30" 
                      icon={Calendar} 
                      type="number" 
                    />
                  </FieldGroup>
                </div>
              </div>

              {/* Default Notes */}
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
                  <TextAreaInput 
                    value={form.defaultNotes} 
                    onChange={(v) => updateForm('defaultNotes', v)} 
                    placeholder="Pago mediante transferencia bancaria..." 
                    rows={4} 
                  />
                </FieldGroup>
              </div>
              
              {/* Invoice preview card */}
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
          )}

          {/* =================== APARIENCIA =================== */}
          {activeSection === 'appearance' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Theme Selection */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-primary/10">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tema de la Interfaz</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Selecciona el modo de visualización preferido</p>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {([
                    { id: 'light' as const, label: 'Claro', icon: Sun, desc: 'Fondo blanco, texto oscuro' },
                    { id: 'dark' as const, label: 'Oscuro', icon: Moon, desc: 'Fondo oscuro, texto claro' },
                    { id: 'system' as const, label: 'Sistema', icon: Monitor, desc: 'Automático según tu SO' },
                  ]).map((theme) => {
                    const Icon = theme.icon;
                    const isSelected = form.theme === theme.id;
                    return (
                      <button
                        key={theme.id}
                        onClick={() => updateForm('theme', theme.id)}
                        className={`
                          relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer
                          ${isSelected 
                            ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30'
                          }
                        `}
                      >
                        {isSelected && (
                          <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                            <Check className="w-3 h-3 text-white" />
                          </div>
                        )}
                        <div className={`
                          p-3 rounded-xl transition-colors
                          ${isSelected ? 'bg-primary/10 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}
                        `}>
                          <Icon className="w-6 h-6" />
                        </div>
                        <div className="text-center">
                          <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}>
                            {theme.label}
                          </p>
                          <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{theme.desc}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Accent Color */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2.5 rounded-xl bg-pink-500/10">
                    <Sparkles className="w-5 h-5 text-pink-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Color de Acento</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Color principal de la marca en la interfaz</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-4">
                  {accentColors.map((color) => {
                    const isSelected = form.accentColor === color.id;
                    return (
                      <button
                        key={color.id}
                        onClick={() => updateForm('accentColor', color.id)}
                        className={`
                          flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                          ${isSelected 
                            ? `border-current ${color.ring} ring-4 shadow-sm` 
                            : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                          }
                        `}
                      >
                        <div className={`w-6 h-6 rounded-full ${color.class} shadow-inner ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#0e0e0e]' : ''}`} />
                        <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>
                          {color.label}
                        </span>
                        {isSelected && <Check className="w-4 h-4 text-primary ml-1" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* =================== ZONA DE PELIGRO =================== */}
          {activeSection === 'danger' && (
            <div className="space-y-6 animate-in fade-in duration-300">
              {/* Reset Settings */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-amber-200 dark:border-amber-900/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-amber-500/10">
                    <RotateCcw className="w-5 h-5 text-amber-600 dark:text-amber-500" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Restaurar Configuración</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Revertir todos los ajustes a sus valores predeterminados</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  Esta acción restaurará todos los campos de configuración de la empresa (nombre, RUT, giro, preferencias de facturación, tema visual) a sus valores originales. <strong>Tus clientes y facturas no serán afectados.</strong>
                </p>
                {!showResetConfirm ? (
                  <button
                    onClick={() => setShowResetConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Restaurar valores predeterminados
                  </button>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
                    <CircleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
                    <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">
                      ¿Estás seguro? Se perderán todos tus ajustes personalizados.
                    </p>
                    <div className="flex gap-2 shrink-0">
                      <button
                        onClick={() => setShowResetConfirm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleResetSettings}
                        disabled={isSaving}
                        className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Restaurando...' : 'Confirmar'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Wipe Data */}
              <div className="bg-white dark:bg-[#0e0e0e] border border-red-200 dark:border-red-900/30 rounded-2xl p-6 shadow-sm">
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-2.5 rounded-xl bg-red-500/10">
                    <Trash2 className="w-5 h-5 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-red-700 dark:text-red-400">Eliminar Datos de Negocio</h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500">Borrar todos los clientes y facturas del sistema</p>
                  </div>
                </div>
                <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-4 leading-relaxed">
                  Esta acción eliminará permanentemente todos los <strong>clientes</strong> y <strong>facturas</strong> almacenados en el sistema local. La configuración de la empresa se mantendrá intacta. Al recargar la página se restaurarán los datos de demostración.
                </p>
                {!showWipeConfirm ? (
                  <button
                    onClick={() => setShowWipeConfirm(true)}
                    className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-500/5 hover:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-semibold transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                    Eliminar todos los datos
                  </button>
                ) : (
                  <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
                    <div className="flex items-center gap-3">
                      <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
                      <p className="text-sm text-red-800 dark:text-red-300 font-medium">
                        ⚠️ Esta acción no se puede deshacer. Todos los clientes y facturas serán eliminados.
                      </p>
                    </div>
                    <div className="flex gap-2 justify-end">
                      <button
                        onClick={() => setShowWipeConfirm(false)}
                        className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={handleWipeData}
                        disabled={isSaving}
                        className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50"
                      >
                        {isSaving ? 'Eliminando...' : 'Eliminar Todo'}
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Info Card */}
              <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
                <CircleAlert className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nota sobre los datos</p>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">
                    Actualmente, los datos de clientes y facturas se almacenan localmente en tu navegador (localStorage). Cuando conectes el backend de Laravel, esta sección se actualizará para gestionar datos reales del servidor con confirmaciones de eliminación seguras.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
