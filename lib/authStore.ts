import { create } from 'zustand';

export interface UserProfile {
  name: string;
  email: string;
  role: string;
  company: string;
}

export interface CompanySettings {
  // Datos de la empresa
  companyName: string;
  taxId: string;
  giro: string;
  address: string;
  city: string;
  phone: string;
  website: string;
  logoUrl: string;

  // Datos del emisor SII
  siiResolution: string;
  siiResolutionDate: string;
  siiActivity: string;

  // Preferencias de facturación
  currency: string;
  vatRate: number;
  invoicePrefix: string;
  nextFolioNumber: number;
  defaultPaymentTermsDays: number;
  defaultNotes: string;

  // Personalización visual
  theme: 'light' | 'dark' | 'system';
  accentColor: 'emerald' | 'blue' | 'violet' | 'amber' | 'rose';
}

interface AuthStore {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isInitialized: boolean;
  companySettings: CompanySettings;
  
  initialize: () => void;
  login: (email: string, name?: string, company?: string) => Promise<boolean>;
  register: (email: string, name: string, company: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateCompanySettings: (updates: Partial<CompanySettings>) => void;
  resetCompanySettings: () => void;
}

// ─── Helper: per-user localStorage key ────────────────
function settingsKey(userId: string) { return `company_settings_${userId}`; }

// ─── Demo Users ───────────────────────────────────────

export interface DemoUser {
  name: string;
  email: string;
  password: string;
  company: string;
  role: string;
  description: string;
  color: string;
  initials: string;
}

export const DEMO_USERS: DemoUser[] = [
  {
    name: 'Elías Sánchez',
    email: 'elias@misaas.cl',
    password: '123456',
    company: 'Mi Empresa SaaS SpA',
    role: 'Administrador',
    description: 'Empresa de desarrollo de software y consultoría TI',
    color: 'emerald',
    initials: 'ES',
  },
  {
    name: 'María González',
    email: 'maria@logistica.cl',
    password: '123456',
    company: 'Logística Express SpA',
    role: 'Administrador',
    description: 'Transporte y logística de carga a nivel nacional',
    color: 'blue',
    initials: 'MG',
  },
  {
    name: 'Carlos Ruiz',
    email: 'carlos@fintech.cl',
    password: '123456',
    company: 'FinTech Solutions SpA',
    role: 'Administrador',
    description: 'Soluciones financieras y plataformas de pago',
    color: 'violet',
    initials: 'CR',
  },
];

// ─── Default Company Settings per Demo User ───────────

const SETTINGS_ELIAS: CompanySettings = {
  companyName: 'Mi Empresa SaaS SpA',
  taxId: '77.654.321-K',
  giro: 'Servicios de Desarrollo de Software',
  address: 'Av. Providencia 1234, Oficina 56',
  city: 'Santiago, Chile',
  phone: '+56 2 2345 6789',
  website: 'https://misaas.cl',
  logoUrl: '',
  siiResolution: 'Resolución Exenta SII N° 80',
  siiResolutionDate: '2022-08-15',
  siiActivity: 'Servicios de Procesamiento de Datos',
  currency: 'CLP',
  vatRate: 19,
  invoicePrefix: 'FAC',
  nextFolioNumber: 25,
  defaultPaymentTermsDays: 30,
  defaultNotes: 'Pago mediante transferencia bancaria a la cuenta indicada. Factura electrónica emitida conforme a la Ley 19.799.',
  theme: 'dark',
  accentColor: 'emerald',
};

const SETTINGS_MARIA: CompanySettings = {
  companyName: 'Logística Express SpA',
  taxId: '76.300.400-5',
  giro: 'Transporte de Carga por Carretera',
  address: 'Av. Américo Vespucio Norte 2680',
  city: 'Quilicura, Santiago',
  phone: '+56 2 2876 5432',
  website: 'https://logisticaexpress.cl',
  logoUrl: '',
  siiResolution: 'Resolución Exenta SII N° 112',
  siiResolutionDate: '2023-03-20',
  siiActivity: 'Transporte de Carga por Carretera',
  currency: 'CLP',
  vatRate: 19,
  invoicePrefix: 'LOG',
  nextFolioNumber: 13,
  defaultPaymentTermsDays: 45,
  defaultNotes: 'Transferencia electrónica a Cuenta Corriente Banco Estado. Factura sujeta a Ley 19.983.',
  theme: 'dark',
  accentColor: 'blue',
};

const SETTINGS_CARLOS: CompanySettings = {
  companyName: 'FinTech Solutions SpA',
  taxId: '77.500.600-2',
  giro: 'Servicios Financieros y Tecnología',
  address: 'Isidora Goyenechea 2800, Piso 20',
  city: 'Las Condes, Santiago',
  phone: '+56 2 2700 9000',
  website: 'https://fintechsolutions.cl',
  logoUrl: '',
  siiResolution: 'Resolución Exenta SII N° 45',
  siiResolutionDate: '2024-01-10',
  siiActivity: 'Actividades de Servicios Financieros',
  currency: 'CLP',
  vatRate: 19,
  invoicePrefix: 'FIN',
  nextFolioNumber: 19,
  defaultPaymentTermsDays: 30,
  defaultNotes: 'Pago a 30 días fecha factura. Transferencia a cuenta BCI. Documento emitido según normativa SII.',
  theme: 'dark',
  accentColor: 'violet',
};

const DEFAULT_SETTINGS: CompanySettings = {
  companyName: 'Mi Empresa',
  taxId: '76.000.000-0',
  giro: 'Actividad Económica',
  address: 'Dirección',
  city: 'Santiago, Chile',
  phone: '+56 9 0000 0000',
  website: '',
  logoUrl: '',
  siiResolution: '',
  siiResolutionDate: '',
  siiActivity: '',
  currency: 'CLP',
  vatRate: 19,
  invoicePrefix: 'FAC',
  nextFolioNumber: 1,
  defaultPaymentTermsDays: 30,
  defaultNotes: '',
  theme: 'dark',
  accentColor: 'emerald',
};

const DEMO_SETTINGS: Record<string, CompanySettings> = {
  'elias@misaas.cl': SETTINGS_ELIAS,
  'maria@logistica.cl': SETTINGS_MARIA,
  'carlos@fintech.cl': SETTINGS_CARLOS,
};

function getDefaultSettings(userId: string): CompanySettings {
  return DEMO_SETTINGS[userId] || DEFAULT_SETTINGS;
}

// ─── Auth Store ───────────────────────────────────────

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  companySettings: DEFAULT_SETTINGS,

  initialize: () => {
    if (typeof window === 'undefined' || get().isInitialized) return;
    
    const storedUser = localStorage.getItem('auth_user');
    const storedAuth = localStorage.getItem('auth_authenticated');
    
    if (storedUser && storedAuth === 'true') {
      const user: UserProfile = JSON.parse(storedUser);
      const userId = user.email;
      
      const storedSettings = localStorage.getItem(settingsKey(userId));
      const settings = storedSettings 
        ? { ...getDefaultSettings(userId), ...JSON.parse(storedSettings) }
        : getDefaultSettings(userId);

      set({
        user,
        isAuthenticated: true,
        isInitialized: true,
        companySettings: settings
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        companySettings: DEFAULT_SETTINGS
      });
    }
  },

  login: async (email, name, company) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    // Check if it's a demo user for auto-fill
    const demoUser = DEMO_USERS.find(u => u.email === email);

    const finalUser: UserProfile = {
      name: name || demoUser?.name || email.split('@')[0],
      email: email,
      role: 'Administrador',
      company: company || demoUser?.company || 'Mi Empresa'
    };

    const userId = finalUser.email;
    const storedSettings = typeof window !== 'undefined' 
      ? localStorage.getItem(settingsKey(userId)) 
      : null;
    const settings = storedSettings 
      ? { ...getDefaultSettings(userId), ...JSON.parse(storedSettings) }
      : getDefaultSettings(userId);

    set({
      user: finalUser,
      isAuthenticated: true,
      companySettings: settings
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(finalUser));
      localStorage.setItem('auth_authenticated', 'true');
    }

    return true;
  },

  register: async (email, name, company) => {
    await new Promise(resolve => setTimeout(resolve, 1000));

    const finalUser: UserProfile = {
      name: name,
      email: email,
      role: 'Administrador',
      company: company
    };

    const userId = finalUser.email;
    const settings = getDefaultSettings(userId);

    set({
      user: finalUser,
      isAuthenticated: true,
      companySettings: { ...settings, companyName: company }
    });

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(finalUser));
      localStorage.setItem('auth_authenticated', 'true');
    }

    return true;
  },

  logout: () => {
    set({
      user: null,
      isAuthenticated: false,
      companySettings: DEFAULT_SETTINGS
    });

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_user');
      localStorage.removeItem('auth_authenticated');
    }
  },

  updateProfile: (updates) => {
    const currentUser = get().user;
    if (!currentUser) return;

    const updatedUser = { ...currentUser, ...updates };
    set({ user: updatedUser });

    if (typeof window !== 'undefined') {
      localStorage.setItem('auth_user', JSON.stringify(updatedUser));
    }
  },

  updateCompanySettings: (updates) => {
    const current = get().companySettings;
    const userId = get().user?.email;
    const updated = { ...current, ...updates };
    set({ companySettings: updated });

    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(settingsKey(userId), JSON.stringify(updated));
    }
  },

  resetCompanySettings: () => {
    const userId = get().user?.email;
    const defaults = userId ? getDefaultSettings(userId) : DEFAULT_SETTINGS;
    set({ companySettings: defaults });
    if (typeof window !== 'undefined' && userId) {
      localStorage.removeItem(settingsKey(userId));
    }
  }
}));
