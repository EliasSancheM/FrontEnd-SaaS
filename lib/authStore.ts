import { create } from 'zustand';
import { api } from './api';

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
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, name: string, company: string, password: string) => Promise<boolean>;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateCompanySettings: (updates: Partial<CompanySettings>) => Promise<void>;
  resetCompanySettings: () => Promise<void>;
}

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

    const token = localStorage.getItem('auth_token');

    if (!token) {
      set({ isInitialized: true });
      return;
    }

    api.get('/me')
      .then((response) => {
        const userData = response.data;
        const user: UserProfile = {
          name: userData.name,
          email: userData.email,
          role: userData.roles?.[0]?.name || 'Administrador',
          company: userData.tenant?.name || 'Mi Empresa',
        };

        const userId = user.email;
        // El backend es la fuente de verdad para la configuración de empresa.
        const tenantSettings = (userData.tenant?.settings ?? {}) as Partial<CompanySettings>;
        const settings = { ...getDefaultSettings(userId), ...tenantSettings };

        localStorage.setItem('auth_user', JSON.stringify(user));

        set({
          user,
          isAuthenticated: true,
          isInitialized: true,
          companySettings: settings,
        });
      })
      .catch(() => {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_user');
        set({
          user: null,
          isAuthenticated: false,
          isInitialized: true,
          companySettings: DEFAULT_SETTINGS,
        });
      });
  },

  login: async (email, password) => {
    try {
      const response = await api.post('/login', { email, password });
      const { token, user: userData } = response.data;

      const user: UserProfile = {
        name: userData.name,
        email: userData.email,
        role: userData.roles?.[0]?.name || 'Administrador',
        company: userData.tenant?.name || 'Mi Empresa',
      };

      const userId = user.email;
      const tenantSettings = (userData.tenant?.settings ?? {}) as Partial<CompanySettings>;
      const settings = { ...getDefaultSettings(userId), ...tenantSettings };

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      set({
        user,
        isAuthenticated: true,
        companySettings: settings,
      });

      return true;
    } catch {
      return false;
    }
  },

  register: async (email, name, company, password) => {
    try {
      const response = await api.post('/register', {
        company_name: company,
        name,
        email,
        password,
        password_confirmation: password,
      });
      const { token, user: userData } = response.data;

      const user: UserProfile = {
        name: userData.name,
        email: userData.email,
        role: userData.roles?.[0]?.name || 'Administrador',
        company: userData.tenant?.name || company,
      };

      const userId = user.email;
      const settings = getDefaultSettings(userId);

      if (typeof window !== 'undefined') {
        localStorage.setItem('auth_token', token);
        localStorage.setItem('auth_user', JSON.stringify(user));
      }

      set({
        user,
        isAuthenticated: true,
        companySettings: { ...settings, companyName: company },
      });

      return true;
    } catch {
      return false;
    }
  },

  logout: async () => {
    try {
      await api.post('/logout');
    } catch {
      // Continue even if the API call fails
    }

    if (typeof window !== 'undefined') {
      localStorage.removeItem('auth_token');
      localStorage.removeItem('auth_user');
    }

    set({
      user: null,
      isAuthenticated: false,
      companySettings: DEFAULT_SETTINGS,
    });
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

  updateCompanySettings: async (updates) => {
    const previous = get().companySettings;
    const updated = { ...previous, ...updates };

    // Actualización optimista de la UI.
    set({ companySettings: updated });
    if (updates.companyName) {
      const u = get().user;
      if (u) set({ user: { ...u, company: updates.companyName } });
    }

    try {
      await api.put('/tenant', { settings: updated });
    } catch (error) {
      // Revertir si el backend rechaza el guardado.
      set({ companySettings: previous });
      throw error;
    }
  },

  resetCompanySettings: async () => {
    const userId = get().user?.email;
    const defaults = userId ? getDefaultSettings(userId) : DEFAULT_SETTINGS;
    const previous = get().companySettings;
    set({ companySettings: defaults });
    try {
      await api.put('/tenant', { settings: defaults });
    } catch (error) {
      set({ companySettings: previous });
      throw error;
    }
  },
}));
