'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSaaSStore } from '@/lib/store';
import { 
  ArrowLeft, 
  Building2, 
  Mail, 
  Phone, 
  MapPin, 
  Edit, 
  Trash2, 
  FileText, 
  DollarSign, 
  Clock, 
  Percent, 
  CheckCircle,
  Eye,
  FileDown,
  CreditCard,
  X,
  Loader2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface ClientDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function ClientDetailContent({ params }: ClientDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);
  
  const { 
    clients, 
    invoices, 
    updateClient, 
    deleteClient, 
    markInvoiceAsPaid,
    initialize, 
    isInitialized 
  } = useSaaSStore();

  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    taxId: '',
    email: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive'
  });

  useEffect(() => {
    initialize();
  }, [initialize]);

  const client = clients.find(c => c.id === id);

  // Inicializar formulario de edición
  useEffect(() => {
    if (client) {
      setFormData({
        name: client.name,
        taxId: client.taxId,
        email: client.email,
        phone: client.phone,
        address: client.address,
        status: client.status
      });
    }
  }, [client]);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400">Cargando ficha del cliente...</p>
      </div>
    );
  }

  if (!client) {
    return (
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-650 flex items-center justify-center mx-auto mb-4">
          <Trash2 className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Cliente no encontrado</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          El cliente que intentas consultar no existe o ha sido eliminado del sistema.
        </p>
        <Link 
          href="/clients" 
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Clientes
        </Link>
      </div>
    );
  }

  // Facturas del cliente
  const clientInvoices = invoices.filter(inv => inv.clientId === client.id);

  // KPIs Financieros
  const totalBilled = clientInvoices
    .filter(inv => inv.status !== 'cancelled')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const pendingBalance = clientInvoices
    .filter(inv => inv.status === 'sent' || inv.status === 'overdue' || inv.status === 'draft')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const totalPaid = clientInvoices
    .filter(inv => inv.status === 'paid')
    .reduce((acc, inv) => acc + inv.amount, 0);

  const paidInvoicesCount = clientInvoices.filter(i => i.status === 'paid').length;
  const paymentRate = clientInvoices.length > 0 
    ? Math.round((paidInvoicesCount / clientInvoices.length) * 100)
    : 100;

  // Editar cliente
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateClient(client.id, formData);
    setIsEditing(false);
    toast.success('Información del cliente actualizada con éxito');
  };

  // Eliminar cliente
  const handleDeleteClient = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar a ${client.name}? Esta acción no se puede deshacer.`)) {
      deleteClient(client.id);
      toast.success('Cliente eliminado correctamente');
      router.push('/clients');
    }
  };

  // Marcar factura como pagada
  const handleMarkAsPaid = (invoiceId: string, invoiceNumber: string) => {
    markInvoiceAsPaid(invoiceId);
    toast.success(`Factura ${invoiceNumber} registrada como PAGADA`, {
      icon: '💰'
    });
  };

  const handleDownloadPdf = (invoiceNumber: string) => {
    toast.success(`Descargando PDF de la factura ${invoiceNumber}...`);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* BOTÓN VOLVER & ACCIONES CABECERA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/clients" 
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-zinc-650 dark:text-zinc-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {client.name}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                client.status === 'active' 
                  ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-450' 
                  : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
              }`}>
                {client.status === 'active' ? 'Activo' : 'Inactivo'}
              </span>
            </div>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-1">
              Ficha del receptor y resumen de transacciones financieras históricas.
            </p>
          </div>
        </div>

        {/* ACCIONES */}
        <div className="flex items-center gap-3">
          <button 
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-4 py-2.5 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-sm font-semibold rounded-xl transition-all cursor-pointer text-zinc-700 dark:text-zinc-200"
          >
            <Edit className="w-4 h-4" />
            Editar
          </button>
          <button 
            onClick={handleDeleteClient}
            className="flex items-center gap-2 px-4 py-2.5 border border-red-200 hover:border-red-300 dark:border-red-950/80 bg-red-500/5 hover:bg-red-500/10 text-red-600 dark:text-red-400 text-sm font-semibold rounded-xl transition-all cursor-pointer"
          >
            <Trash2 className="w-4 h-4" />
            Eliminar
          </button>
        </div>
      </div>

      {/* KPI METRICS */}
      <div className="grid gap-6 sm:grid-cols-4">
        {/* Total Facturado */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 text-zinc-750 dark:text-zinc-300">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Histórico Facturado</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              ${totalBilled.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Deuda Pendiente */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Por Cobrar</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              ${pendingBalance.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Total Pagado */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-emerald-500/10 text-primary dark:bg-emerald-500/5">
            <CheckCircle className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Monto Recibido</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              ${totalPaid.toLocaleString()}
            </h4>
          </div>
        </div>

        {/* Tasa de Cumplimiento */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-500/10 text-blue-600 dark:bg-blue-500/5 dark:text-blue-400">
            <Percent className="w-5 h-5" />
          </div>
          <div>
            <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">Tasa de Pago</span>
            <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-0.5">
              {paymentRate}%
            </h4>
          </div>
        </div>
      </div>

      {/* CUADRO GENERAL & HISTORIAL */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* DETALLES DEL RECEPTOR */}
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm h-fit space-y-6">
          <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
            <Building2 className="w-4 h-4" />
            Datos de Facturación
          </h3>

          <div className="space-y-4 text-sm">
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Razón Social</span>
              <span className="font-bold text-zinc-800 dark:text-zinc-200 mt-1 block">{client.name}</span>
            </div>
            <div>
              <span className="text-xs text-zinc-400 dark:text-zinc-500 block">RUT / Identificación Fiscal</span>
              <span className="font-mono text-zinc-850 dark:text-zinc-300 mt-1 block">{client.taxId}</span>
            </div>
            <div className="h-px bg-zinc-100 dark:bg-zinc-900" />
            
            <div className="flex items-start gap-3">
              <Mail className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
              <div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Correo Facturación</span>
                <a href={`mailto:${client.email}`} className="text-primary hover:underline font-semibold break-all">{client.email}</a>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Phone className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
              <div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Teléfono de Enlace</span>
                <span className="text-zinc-800 dark:text-zinc-350 font-semibold">{client.phone}</span>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <MapPin className="w-4 h-4 text-zinc-400 mt-1 shrink-0" />
              <div>
                <span className="text-xs text-zinc-400 dark:text-zinc-500 block">Dirección Tributaria</span>
                <span className="text-zinc-850 dark:text-zinc-300 font-semibold leading-relaxed block">{client.address}</span>
              </div>
            </div>
          </div>
        </div>

        {/* HISTORIAL DE FACTURAS */}
        <div className="lg:col-span-2 bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm overflow-hidden flex flex-col justify-between">
          <div className="p-6 border-b border-zinc-100 dark:border-zinc-900">
            <h3 className="font-bold text-zinc-950 dark:text-white text-lg">Facturas Emitidas</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">Historial correlativo exclusivo para este receptor.</p>
          </div>

          {clientInvoices.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-zinc-100 dark:border-zinc-900 bg-zinc-50/50 dark:bg-[#0b0b0b] text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-6">Documento</th>
                    <th className="py-3 px-6">Fecha Emisión</th>
                    <th className="py-3 px-6">Monto</th>
                    <th className="py-3 px-6">Estado</th>
                    <th className="py-3 px-6 text-right">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-900 text-sm">
                  {clientInvoices.map((invoice) => (
                    <tr key={invoice.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-900/10 transition-colors">
                      <td className="py-3.5 px-6 font-semibold text-zinc-900 dark:text-white flex items-center gap-2">
                        <FileText className="w-4 h-4 text-zinc-400" />
                        {invoice.number}
                      </td>
                      <td className="py-3.5 px-6 text-zinc-500 dark:text-zinc-450">{invoice.issueDate}</td>
                      <td className="py-3.5 px-6 font-bold text-zinc-900 dark:text-white">
                        ${invoice.amount.toLocaleString()}
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`
                          inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-extrabold
                          ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5' : ''}
                          ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5' : ''}
                          ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                          ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-550 dark:bg-zinc-900 dark:text-zinc-400' : ''}
                        `}>
                          {invoice.statusLabel}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <Link 
                            href={`/invoices/${invoice.id}`}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-zinc-900 hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900 transition-colors"
                            title="Ver Detalle"
                          >
                            <Eye className="w-4.5 h-4.5" />
                          </Link>
                          <button 
                            onClick={() => handleDownloadPdf(invoice.number)}
                            className="p-1.5 rounded-lg text-zinc-400 hover:text-emerald-500 hover:bg-emerald-500/5 dark:hover:text-emerald-400 dark:hover:bg-emerald-950/20 transition-colors"
                            title="Descargar PDF"
                          >
                            <FileDown className="w-4.5 h-4.5" />
                          </button>
                          {invoice.status !== 'paid' && (
                            <button 
                              onClick={() => handleMarkAsPaid(invoice.id, invoice.number)}
                              className="p-1.5 rounded-lg text-zinc-400 hover:text-blue-650 hover:bg-blue-500/5 dark:hover:text-blue-400 dark:hover:bg-blue-950/20 transition-colors"
                              title="Registrar Pago"
                            >
                              <CreditCard className="w-4.5 h-4.5" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-12 text-center flex-1 flex flex-col justify-center items-center">
              <FileText className="w-10 h-10 text-zinc-300 dark:text-zinc-650 mb-3" />
              <h4 className="text-zinc-900 dark:text-white font-bold text-sm">Sin facturas emitidas</h4>
              <p className="text-xs text-zinc-550 dark:text-zinc-400 mt-1 max-w-xs leading-relaxed">
                Este cliente no cuenta con documentos electrónicos registrados a la fecha.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* MODAL DE EDICIÓN RAPIDA GLASSMORPHIC */}
      {isEditing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-lg backdrop-blur-2xl bg-zinc-900/90 border border-zinc-800 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-white">
            
            <div className="flex items-center justify-between p-6 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-emerald-400" />
                <h3 className="font-bold text-lg">Modificar Ficha Cliente</h3>
              </div>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-1.5 rounded-lg hover:bg-zinc-800 text-zinc-450 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleEditSubmit} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">Razón Social</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white placeholder-zinc-500 transition-all"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">RUT / ID Fiscal</label>
                  <input 
                    type="text" 
                    value={formData.taxId}
                    onChange={(e) => setFormData({ ...formData, taxId: e.target.value })}
                    className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white placeholder-zinc-500 transition-all"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">Estado Tributario</label>
                  <select 
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as 'active' | 'inactive' })}
                    className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white transition-all"
                  >
                    <option value="active" className="bg-zinc-900">Activo</option>
                    <option value="inactive" className="bg-zinc-900">Inactivo</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">Email Tributario</label>
                <input 
                  type="email" 
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white placeholder-zinc-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">Teléfono</label>
                <input 
                  type="text" 
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white placeholder-zinc-500 transition-all"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-450 mb-1.5">Dirección Tributaria</label>
                <input 
                  type="text" 
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                  className="w-full px-3 py-2.5 bg-zinc-800/40 border border-zinc-800 focus:border-emerald-500 rounded-xl text-sm focus:outline-none focus:ring-4 focus:ring-emerald-500/10 text-white placeholder-zinc-500 transition-all"
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-zinc-800">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2 border border-zinc-850 hover:bg-zinc-800 text-zinc-350 hover:text-white rounded-xl text-sm font-bold transition-all cursor-pointer"
                >
                  Cancelar
                </button>
                <button 
                  type="submit"
                  className="px-5 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all cursor-pointer shadow-lg shadow-emerald-500/10"
                >
                  Guardar Cambios
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
}
