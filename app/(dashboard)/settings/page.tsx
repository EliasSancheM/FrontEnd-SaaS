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
  ChevronRight,
  Loader2
} from 'lucide-react';

import CompanySection from './CompanySection';
import IssuerSection from './IssuerSection';
import BillingSection from './BillingSection';
import AppearanceSection from './AppearanceSection';
import DangerSection from './DangerSection';

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

export default function SettingsPage() {
  const { user, companySettings, updateProfile, updateCompanySettings, resetCompanySettings } = useAuthStore();
  const saasStore = useSaaSStore();
  const [activeSection, setActiveSection] = useState<SettingsSection>('company');
  const [isSaving, setIsSaving] = useState(false);

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

  const updateForm = (key: keyof typeof form, value: string | number) => {
    setForm(prev => ({ ...prev, [key]: value }));
  };

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
          {activeSection === 'company' && (
            <CompanySection
              form={form}
              updateForm={updateForm}
              profileForm={profileForm}
              setProfileForm={setProfileForm}
            />
          )}

          {activeSection === 'issuer' && (
            <IssuerSection form={form} updateForm={updateForm} />
          )}

          {activeSection === 'billing' && (
            <BillingSection form={form} updateForm={updateForm} />
          )}

          {activeSection === 'appearance' && (
            <AppearanceSection form={form} updateForm={updateForm} />
          )}

          {activeSection === 'danger' && (
            <DangerSection
              isSaving={isSaving}
              onResetSettings={handleResetSettings}
              onWipeData={handleWipeData}
            />
          )}
        </div>
      </div>
    </div>
  );
}
