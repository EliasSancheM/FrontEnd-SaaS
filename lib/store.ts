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
  
  initialize: () => void;
  addClient: (client: Omit<Client, 'id'>) => Client;
  deleteClient: (id: string) => void;
  updateClient: (id: string, updated: Partial<Client>) => void;
  
  addInvoice: (invoice: Omit<Invoice, 'id' | 'statusLabel'>) => Invoice;
  markInvoiceAsPaid: (id: string) => void;
  deleteInvoice: (id: string) => void;
}

const INITIAL_CLIENTS: Client[] = [
  { id: '1', name: 'Acme Corporation SpA', taxId: 'RUT: 76.543.210-9', email: 'contacto@acme.com', phone: '+56 9 8765 4321', address: 'Av. Vitacura 2670, Las Condes, Santiago', status: 'active' },
  { id: '2', name: 'Inversiones Andes SpA', taxId: 'RUT: 77.890.123-K', email: 'finanzas@andes.cl', phone: '+56 2 2456 7890', address: 'Apoquindo 4500, Oficina 801, Las Condes', status: 'active' },
  { id: '3', name: 'Transportes Transa Ltda', taxId: 'RUT: 76.111.222-3', email: 'facturacion@transa.cl', phone: '+56 9 9876 5432', address: 'Ruta 5 Norte Km 15, Quilicura', status: 'active' },
  { id: '4', name: 'Servicios Logísticos S.A.', taxId: 'RUT: 76.999.888-7', email: 'pagos@servilog.cl', phone: '+56 2 2987 6543', address: 'Américo Vespucio Sur 1250, Pudahuel', status: 'inactive' },
];

const INITIAL_INVOICES: Invoice[] = [
  { 
    id: '1', 
    number: 'FAC-0024', 
    client: 'Acme Corporation SpA', 
    clientId: '1',
    issueDate: '2026-05-18', 
    dueDate: '2026-06-18', 
    amount: 1250000, 
    subtotal: 1050420,
    tax: 199580,
    items: [{ description: 'Servicios de Consultoría TI Mensual', quantity: 1, unitPrice: 1050420 }],
    status: 'paid', 
    statusLabel: 'Pagado' 
  },
  { 
    id: '2', 
    number: 'FAC-0023', 
    client: 'Inversiones Andes SpA', 
    clientId: '2',
    issueDate: '2026-05-15', 
    dueDate: '2026-06-15', 
    amount: 420000, 
    subtotal: 352941,
    tax: 67059,
    items: [{ description: 'Soporte de Servidores y Cloud Backup', quantity: 1, unitPrice: 352941 }],
    status: 'sent', 
    statusLabel: 'Pendiente' 
  },
  { 
    id: '3', 
    number: 'FAC-0022', 
    client: 'Transportes Transa Ltda', 
    clientId: '3',
    issueDate: '2026-05-12', 
    dueDate: '2026-06-12', 
    amount: 2800000, 
    subtotal: 2352941,
    tax: 447059,
    items: [{ description: 'Logística de Despacho y Fletes Nacionales', quantity: 1, unitPrice: 2352941 }],
    status: 'paid', 
    statusLabel: 'Pagado' 
  },
  { 
    id: '4', 
    number: 'FAC-0021', 
    client: 'Servicios Logísticos S.A.', 
    clientId: '4',
    issueDate: '2026-05-10', 
    dueDate: '2026-05-20', 
    amount: 980000, 
    subtotal: 823529,
    tax: 156471,
    items: [{ description: 'Mantenimiento Preventivo de Flotas', quantity: 1, unitPrice: 823529 }],
    status: 'overdue', 
    statusLabel: 'Vencido' 
  },
  { 
    id: '5', 
    number: 'FAC-0020', 
    client: 'Acme Corporation SpA', 
    clientId: '1',
    issueDate: '2026-05-05', 
    dueDate: '2026-06-05', 
    amount: 3500000, 
    subtotal: 2941176,
    tax: 558824,
    items: [{ description: 'Desarrollo de Integración API Ecommerce', quantity: 1, unitPrice: 2941176 }],
    status: 'draft', 
    statusLabel: 'Borrador' 
  },
];

export const useSaaSStore = create<SaaSStore>((set, get) => ({
  clients: [],
  invoices: [],
  isInitialized: false,

  initialize: () => {
    if (typeof window === 'undefined' || get().isInitialized) return;
    
    const storedClients = localStorage.getItem('saas_clients');
    const storedInvoices = localStorage.getItem('saas_invoices');
    
    const finalClients = storedClients ? JSON.parse(storedClients) : INITIAL_CLIENTS;
    const finalInvoices = storedInvoices ? JSON.parse(storedInvoices) : INITIAL_INVOICES;
    
    if (!storedClients) localStorage.setItem('saas_clients', JSON.stringify(finalClients));
    if (!storedInvoices) localStorage.setItem('saas_invoices', JSON.stringify(finalInvoices));
    
    set({
      clients: finalClients,
      invoices: finalInvoices,
      isInitialized: true,
    });
  },

  addClient: (clientData) => {
    const newClient: Client = {
      ...clientData,
      id: `client_${Date.now()}`
    };
    
    const updatedClients = [newClient, ...get().clients];
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_clients', JSON.stringify(updatedClients));
    }
    
    return newClient;
  },

  deleteClient: (id) => {
    const updatedClients = get().clients.filter(c => c.id !== id);
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_clients', JSON.stringify(updatedClients));
    }
  },

  updateClient: (id, updatedFields) => {
    const updatedClients = get().clients.map(c => 
      c.id === id ? { ...c, ...updatedFields } : c
    );
    set({ clients: updatedClients });
    
    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_clients', JSON.stringify(updatedClients));
    }
  },

  addInvoice: (invoiceData) => {
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

    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_invoices', JSON.stringify(updatedInvoices));
    }

    return newInvoice;
  },

  markInvoiceAsPaid: (id) => {
    const updatedInvoices = get().invoices.map(inv => {
      if (inv.id === id) {
        return {
          ...inv,
          status: 'paid' as const,
          statusLabel: 'Pagado'
        };
      }
      return inv;
    });

    set({ invoices: updatedInvoices });

    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_invoices', JSON.stringify(updatedInvoices));
    }
  },

  deleteInvoice: (id) => {
    const updatedInvoices = get().invoices.filter(inv => inv.id !== id);
    set({ invoices: updatedInvoices });

    if (typeof window !== 'undefined') {
      localStorage.setItem('saas_invoices', JSON.stringify(updatedInvoices));
    }
  }
}));
