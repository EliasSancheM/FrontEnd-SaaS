import { create } from 'zustand';

export interface Client {
  id: string;
  name: string;
  taxId: string;
  email: string;
  phone: string;
  address: string;
  status: 'active' | 'inactive';
}

export interface InvoiceItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface Invoice {
  id: string;
  number: string;
  client: string;
  clientId: string;
  issueDate: string;
  dueDate: string;
  amount: number;
  subtotal: number;
  tax: number;
  discount?: number;
  items: InvoiceItem[];
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  statusLabel: string;
}

interface SaaSStore {
  clients: Client[];
  invoices: Invoice[];
  isInitialized: boolean;
  currentUserId: string | null;
  
  initialize: (userId?: string) => void;
  reinitialize: (userId: string) => void;
  clearContext: () => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  deleteClient: (id: string) => void;
  updateClient: (id: string, updated: Partial<Client>) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'statusLabel'>) => Invoice;
  markInvoiceAsPaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
}

// ─── Keys helpers ─────────────────────────────────────
function clientsKey(userId: string) { return `saas_clients_${userId}`; }
function invoicesKey(userId: string) { return `saas_invoices_${userId}`; }

// ─── Seed Data per Demo User ──────────────────────────

const SEED_ELIAS: { clients: Client[]; invoices: Invoice[] } = {
  clients: [
    { id: '1', name: 'Acme Corporation SpA', taxId: 'RUT: 76.543.210-9', email: 'contacto@acme.com', phone: '+56 9 8765 4321', address: 'Av. Vitacura 2670, Las Condes, Santiago', status: 'active' },
    { id: '2', name: 'Inversiones Andes SpA', taxId: 'RUT: 77.890.123-K', email: 'finanzas@andes.cl', phone: '+56 2 2456 7890', address: 'Apoquindo 4500, Oficina 801, Las Condes', status: 'active' },
    { id: '3', name: 'Transportes Transa Ltda', taxId: 'RUT: 76.111.222-3', email: 'facturacion@transa.cl', phone: '+56 9 9876 5432', address: 'Ruta 5 Norte Km 15, Quilicura', status: 'active' },
    { id: '4', name: 'Servicios Logísticos S.A.', taxId: 'RUT: 76.999.888-7', email: 'pagos@servilog.cl', phone: '+56 2 2987 6543', address: 'Américo Vespucio Sur 1250, Pudahuel', status: 'inactive' },
  ],
  invoices: [
    { id: '1', number: 'FAC-0024', client: 'Acme Corporation SpA', clientId: '1', issueDate: '2026-05-18', dueDate: '2026-06-18', amount: 1250000, subtotal: 1050420, tax: 199580, items: [{ description: 'Servicios de Consultoría TI Mensual', quantity: 1, unitPrice: 1050420 }], status: 'paid', statusLabel: 'Pagado' },
    { id: '2', number: 'FAC-0023', client: 'Inversiones Andes SpA', clientId: '2', issueDate: '2026-05-15', dueDate: '2026-06-15', amount: 420000, subtotal: 352941, tax: 67059, items: [{ description: 'Soporte de Servidores y Cloud Backup', quantity: 1, unitPrice: 352941 }], status: 'sent', statusLabel: 'Pendiente' },
    { id: '3', number: 'FAC-0022', client: 'Transportes Transa Ltda', clientId: '3', issueDate: '2026-05-12', dueDate: '2026-06-12', amount: 2800000, subtotal: 2352941, tax: 447059, items: [{ description: 'Logística de Despacho y Fletes Nacionales', quantity: 1, unitPrice: 2352941 }], status: 'paid', statusLabel: 'Pagado' },
    { id: '4', number: 'FAC-0021', client: 'Servicios Logísticos S.A.', clientId: '4', issueDate: '2026-05-10', dueDate: '2026-05-20', amount: 980000, subtotal: 823529, tax: 156471, items: [{ description: 'Mantenimiento Preventivo de Flotas', quantity: 1, unitPrice: 823529 }], status: 'overdue', statusLabel: 'Vencido' },
    { id: '5', number: 'FAC-0020', client: 'Acme Corporation SpA', clientId: '1', issueDate: '2026-05-05', dueDate: '2026-06-05', amount: 3500000, subtotal: 2941176, tax: 558824, items: [{ description: 'Desarrollo de Integración API Ecommerce', quantity: 1, unitPrice: 2941176 }], status: 'draft', statusLabel: 'Borrador' },
  ],
};

const SEED_MARIA: { clients: Client[]; invoices: Invoice[] } = {
  clients: [
    { id: '1', name: 'Distribuidora Nacional SpA', taxId: 'RUT: 76.200.300-1', email: 'compras@disnac.cl', phone: '+56 9 7654 3210', address: 'Av. Matta 1050, Santiago Centro', status: 'active' },
    { id: '2', name: 'Exportadora del Pacífico Ltda', taxId: 'RUT: 77.300.400-2', email: 'logistica@expacifico.cl', phone: '+56 2 2111 3333', address: 'Puerto de Valparaíso, Bodega 12', status: 'active' },
    { id: '3', name: 'Agroindustrial Los Ríos S.A.', taxId: 'RUT: 76.500.600-K', email: 'pagos@agririos.cl', phone: '+56 9 5432 1098', address: 'Ruta 5 Sur Km 780, Valdivia', status: 'active' },
  ],
  invoices: [
    { id: '1', number: 'LOG-0012', client: 'Distribuidora Nacional SpA', clientId: '1', issueDate: '2026-05-20', dueDate: '2026-06-20', amount: 3200000, subtotal: 2689076, tax: 510924, items: [{ description: 'Flete Santiago-Antofagasta (12 pallets)', quantity: 12, unitPrice: 224090 }], status: 'sent', statusLabel: 'Pendiente' },
    { id: '2', number: 'LOG-0011', client: 'Exportadora del Pacífico Ltda', clientId: '2', issueDate: '2026-05-18', dueDate: '2026-06-18', amount: 5600000, subtotal: 4705882, tax: 894118, items: [{ description: 'Consolidación y despacho contenedor 40ft', quantity: 2, unitPrice: 2352941 }], status: 'paid', statusLabel: 'Pagado' },
    { id: '3', number: 'LOG-0010', client: 'Agroindustrial Los Ríos S.A.', clientId: '3', issueDate: '2026-05-10', dueDate: '2026-05-25', amount: 1800000, subtotal: 1512605, tax: 287395, items: [{ description: 'Transporte refrigerado Valdivia-Santiago', quantity: 3, unitPrice: 504202 }], status: 'overdue', statusLabel: 'Vencido' },
    { id: '4', number: 'LOG-0009', client: 'Distribuidora Nacional SpA', clientId: '1', issueDate: '2026-05-05', dueDate: '2026-06-05', amount: 980000, subtotal: 823529, tax: 156471, items: [{ description: 'Almacenaje mensual bodega seca', quantity: 1, unitPrice: 823529 }], status: 'paid', statusLabel: 'Pagado' },
  ],
};

const SEED_CARLOS: { clients: Client[]; invoices: Invoice[] } = {
  clients: [
    { id: '1', name: 'Banco del Sur S.A.', taxId: 'RUT: 97.100.200-3', email: 'proveedores@bancosur.cl', phone: '+56 2 2600 7000', address: 'Av. El Bosque Norte 0177, Las Condes', status: 'active' },
    { id: '2', name: 'Corredora de Seguros Protección Ltda', taxId: 'RUT: 76.800.900-5', email: 'finanzas@proteccion.cl', phone: '+56 2 2345 9876', address: 'Isidora Goyenechea 3000, Piso 15', status: 'active' },
    { id: '3', name: 'AFP Horizonte S.A.', taxId: 'RUT: 98.200.300-K', email: 'tecnologia@afphorizonte.cl', phone: '+56 2 2700 8000', address: 'Av. Providencia 1760, Providencia', status: 'active' },
    { id: '4', name: 'Finanzas Austral SpA', taxId: 'RUT: 76.400.500-1', email: 'contabilidad@faustral.cl', phone: '+56 9 6789 0123', address: 'Av. Libertador B. O\'Higgins 1449, Santiago', status: 'inactive' },
  ],
  invoices: [
    { id: '1', number: 'FIN-0018', client: 'Banco del Sur S.A.', clientId: '1', issueDate: '2026-05-22', dueDate: '2026-06-22', amount: 8500000, subtotal: 7142857, tax: 1357143, items: [{ description: 'Licencia anual plataforma anti-fraude AI', quantity: 1, unitPrice: 7142857 }], status: 'sent', statusLabel: 'Pendiente' },
    { id: '2', number: 'FIN-0017', client: 'Corredora de Seguros Protección Ltda', clientId: '2', issueDate: '2026-05-19', dueDate: '2026-06-19', amount: 2400000, subtotal: 2016807, tax: 383193, items: [{ description: 'Desarrollo módulo cotizador online', quantity: 1, unitPrice: 2016807 }], status: 'paid', statusLabel: 'Pagado' },
    { id: '3', number: 'FIN-0016', client: 'AFP Horizonte S.A.', clientId: '3', issueDate: '2026-05-15', dueDate: '2026-06-15', amount: 4200000, subtotal: 3529412, tax: 670588, items: [{ description: 'Consultoría migración core bancario', quantity: 80, unitPrice: 44118 }], status: 'paid', statusLabel: 'Pagado' },
    { id: '4', number: 'FIN-0015', client: 'Finanzas Austral SpA', clientId: '4', issueDate: '2026-05-08', dueDate: '2026-05-22', amount: 650000, subtotal: 546218, tax: 103782, items: [{ description: 'Soporte técnico mensual ERP contable', quantity: 1, unitPrice: 546218 }], status: 'overdue', statusLabel: 'Vencido' },
    { id: '5', number: 'FIN-0014', client: 'Banco del Sur S.A.', clientId: '1', issueDate: '2026-05-01', dueDate: '2026-06-01', amount: 12000000, subtotal: 10084034, tax: 1915966, items: [{ description: 'Implementación gateway de pagos v2', quantity: 1, unitPrice: 10084034 }], status: 'draft', statusLabel: 'Borrador' },
  ],
};

const DEFAULT_SEED: { clients: Client[]; invoices: Invoice[] } = {
  clients: [
    { id: '1', name: 'Cliente de Ejemplo SpA', taxId: 'RUT: 76.000.000-0', email: 'ejemplo@empresa.cl', phone: '+56 9 1234 5678', address: 'Santiago, Chile', status: 'active' },
  ],
  invoices: [
    { id: '1', number: 'FAC-0001', client: 'Cliente de Ejemplo SpA', clientId: '1', issueDate: '2026-05-25', dueDate: '2026-06-25', amount: 500000, subtotal: 420168, tax: 79832, items: [{ description: 'Servicio profesional inicial', quantity: 1, unitPrice: 420168 }], status: 'draft', statusLabel: 'Borrador' },
  ],
};

// Map demo emails to their seed data
const DEMO_SEEDS: Record<string, { clients: Client[]; invoices: Invoice[] }> = {
  'elias@misaas.cl': SEED_ELIAS,
  'maria@logistica.cl': SEED_MARIA,
  'carlos@fintech.cl': SEED_CARLOS,
};

function getSeedForUser(userId: string) {
  return DEMO_SEEDS[userId] || DEFAULT_SEED;
}

// ─── Store ────────────────────────────────────────────

export const useSaaSStore = create<SaaSStore>((set, get) => ({
  clients: [],
  invoices: [],
  isInitialized: false,
  currentUserId: null,

  initialize: (userId?: string) => {
    if (typeof window === 'undefined') return;
    
    const targetUserId = userId || get().currentUserId;
    if (!targetUserId) return;
    
    // If already initialized for this user, skip
    if (get().isInitialized && get().currentUserId === targetUserId) return;

    const storedClients = localStorage.getItem(clientsKey(targetUserId));
    const storedInvoices = localStorage.getItem(invoicesKey(targetUserId));
    
    const seed = getSeedForUser(targetUserId);
    const finalClients = storedClients ? JSON.parse(storedClients) : seed.clients;
    const finalInvoices = storedInvoices ? JSON.parse(storedInvoices) : seed.invoices;
    
    if (!storedClients) localStorage.setItem(clientsKey(targetUserId), JSON.stringify(finalClients));
    if (!storedInvoices) localStorage.setItem(invoicesKey(targetUserId), JSON.stringify(finalInvoices));
    
    set({
      clients: finalClients,
      invoices: finalInvoices,
      isInitialized: true,
      currentUserId: targetUserId,
    });
  },

  reinitialize: (userId: string) => {
    // Force reload data for a different user
    set({ isInitialized: false, currentUserId: null });
    get().initialize(userId);
  },

  clearContext: () => {
    set({
      clients: [],
      invoices: [],
      isInitialized: false,
      currentUserId: null,
    });
  },

  addClient: (clientData) => {
    const userId = get().currentUserId;
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}`
    };
    
    const updatedClients = [newClient, ...get().clients];
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(clientsKey(userId), JSON.stringify(updatedClients));
    }
    
    return newClient;
  },

  deleteClient: (id) => {
    const userId = get().currentUserId;
    const updatedClients = get().clients.filter(c => c.id !== id);
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(clientsKey(userId), JSON.stringify(updatedClients));
    }
  },

  updateClient: (id, updatedFields) => {
    const userId = get().currentUserId;
    const updatedClients = get().clients.map(c => 
      c.id === id ? { ...c, ...updatedFields } : c
    );
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(clientsKey(userId), JSON.stringify(updatedClients));
    }
  },

  addInvoice: (invoiceData) => {
    const userId = get().currentUserId;
    const statusMap: Record<Invoice['status'], string> = {
      paid: 'Pagado',
      sent: 'Pendiente',
      overdue: 'Vencido',
      draft: 'Borrador',
      cancelled: 'Cancelado'
    };

    const newInvoice: Invoice = {
      ...invoiceData,
      id: `invoice_${Date.now()}`,
      statusLabel: statusMap[invoiceData.status] || 'Pendiente'
    };

    const updatedInvoices = [newInvoice, ...get().invoices];
    set({ invoices: updatedInvoices });

    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(invoicesKey(userId), JSON.stringify(updatedInvoices));
    }

    return newInvoice;
  },

  markInvoiceAsPaid: (id) => {
    const userId = get().currentUserId;
    const updatedInvoices = get().invoices.map(inv => {
      if (inv.id === id) {
        return { ...inv, status: 'paid' as const, statusLabel: 'Pagado' };
      }
      return inv;
    });

    set({ invoices: updatedInvoices });

    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(invoicesKey(userId), JSON.stringify(updatedInvoices));
    }
  },

  deleteInvoice: (id) => {
    const userId = get().currentUserId;
    const updatedInvoices = get().invoices.filter(inv => inv.id !== id);
    set({ invoices: updatedInvoices });

    if (typeof window !== 'undefined' && userId) {
      localStorage.setItem(invoicesKey(userId), JSON.stringify(updatedInvoices));
    }
  }
}));
