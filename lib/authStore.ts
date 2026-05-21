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

const DEFAULT_USER: UserProfile = {
  name: 'Elías Sánchez',
  email: 'elias@misaas.cl',
  role: 'Administrador',
  company: 'Mi Empresa SaaS SpA'
};

const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
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

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isInitialized: false,
  companySettings: DEFAULT_COMPANY_SETTINGS,

  initialize: () => {
    if (typeof window === 'undefined' || get().isInitialized) return;
    
    const storedUser = localStorage.getItem('auth_user');
    const storedAuth = localStorage.getItem('auth_authenticated');
    const storedSettings = localStorage.getItem('company_settings');
    
    const settings = storedSettings 
      ? { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(storedSettings) }
      : DEFAULT_COMPANY_SETTINGS;

    if (storedUser && storedAuth === 'true') {
      set({
        user: JSON.parse(storedUser),
        isAuthenticated: true,
        isInitialized: true,
        companySettings: settings
      });
    } else {
      set({
        user: null,
        isAuthenticated: false,
        isInitialized: true,
        companySettings: settings
      });
    }
  },

  login: async (email, name, company) => {
    await new Promise(resolve => setTimeout(resolve, 800));

    const finalUser: UserProfile = {
      name: name || DEFAULT_USER.name,
      email: email,
      role: 'Administrador',
      company: company || DEFAULT_USER.company
    };

    set({
      user: finalUser,
      isAuthenticated: true
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

    set({
      user: finalUser,
      isAuthenticated: true
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
      isAuthenticated: false
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
    const updated = { ...current, ...updates };
    set({ companySettings: updated });

    if (typeof window !== 'undefined') {
      localStorage.setItem('company_settings', JSON.stringify(updated));
    }
  },

  resetCompanySettings: () => {
    set({ companySettings: DEFAULT_COMPANY_SETTINGS });
    if (typeof window !== 'undefined') {
      localStorage.removeItem('company_settings');
    }
  }
}));
