'use client';

import React, { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useSaaSStore } from '@/lib/store';
import { 
  ArrowLeft, 
  FileText, 
  Download, 
  CreditCard, 
  Trash2, 
  CheckCircle, 
  AlertCircle, 
  Clock, 
  Building2,
  Calendar,
  DollarSign,
  ChevronRight,
  Loader2,
  X,
  CreditCard as CardIcon,
  Smartphone,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import toast from 'react-hot-toast';

interface InvoiceDetailPageProps {
  params: Promise<{ id: string }>;
}

export default function InvoiceDetailContent({ params }: InvoiceDetailPageProps) {
  const router = useRouter();
  const { id } = use(params);

  const { 
    invoices, 
    clients, 
    markInvoiceAsPaid, 
    deleteInvoice, 
    initialize, 
    isInitialized 
  } = useSaaSStore();

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [paymentStep, setPaymentStep] = useState<'details' | 'processing' | 'success'>('details');
  const [selectedMethod, setSelectedMethod] = useState<'card' | 'transfer' | 'cash'>('card');
  const [selectedGateway, setSelectedGateway] = useState<'mercadopago' | 'paypal'>('mercadopago');
  const [downloading, setDownloading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  const invoice = invoices.find(inv => inv.id === id);

  if (!isInitialized) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
        <p className="text-sm font-semibold text-zinc-550 dark:text-zinc-400">Cargando documento electrónico...</p>
      </div>
    );
  }

  if (!invoice) {
    return (
      <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-12 text-center max-w-xl mx-auto shadow-sm">
        <div className="w-16 h-16 rounded-full bg-red-500/10 text-red-650 flex items-center justify-center mx-auto mb-4">
          <AlertCircle className="w-8 h-8" />
        </div>
        <h3 className="text-xl font-bold text-zinc-900 dark:text-white">Factura no encontrada</h3>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-2">
          El documento tributario electrónico que estás buscando no existe o ha sido eliminado.
        </p>
        <Link 
          href="/invoices" 
          className="inline-flex items-center gap-2 mt-6 px-5 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white dark:bg-white dark:text-zinc-950 dark:hover:bg-zinc-100 font-bold transition-all text-sm"
        >
          <ArrowLeft className="w-4 h-4" />
          Volver a Facturas
        </Link>
      </div>
    );
  }

  const clientInfo = clients.find(c => c.id === invoice.clientId);

  // Registrar pago manual
  const handleMarkAsPaid = () => {
    markInvoiceAsPaid(invoice.id);
    toast.success(`Factura ${invoice.number} marcada como PAGADA con éxito.`, {
      icon: '💰'
    });
  };

  // Simular pago online
  const triggerOnlinePayment = (gateway: 'mercadopago' | 'paypal') => {
    setSelectedGateway(gateway);
    setPaymentStep('details');
    setCheckoutOpen(true);
  };

  const executeSimulatedPayment = () => {
    setPaymentStep('processing');
    const delay = selectedGateway === 'paypal' ? 2400 : 1800;
    setTimeout(() => {
      markInvoiceAsPaid(invoice.id);
      setPaymentStep('success');
      if (selectedGateway === 'paypal') {
        const usdAmount = (invoice.amount / 920).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2});
        toast.success(`¡Transacción aprobada por PayPal! Monto: $${usdAmount} USD`, {
          icon: '🌎'
        });
      } else {
        toast.success('¡Transacción aprobada por Mercado Pago!', {
          icon: '💳'
        });
      }
    }, delay);
  };

  // Eliminar factura
  const handleDelete = () => {
    if (confirm(`¿Estás seguro de que deseas eliminar la factura ${invoice.number}? Esta acción es irreversible.`)) {
      deleteInvoice(invoice.id);
      toast.success('Factura eliminada correctamente');
      router.push('/invoices');
    }
  };

  // Simulación descarga PDF
  const handleDownload = () => {
    setDownloading(true);
    toast.loading(`Generando archivo PDF para ${invoice.number}...`, { id: 'pdf-gen' });
    setTimeout(() => {
      toast.success('PDF generado e iniciado descarga en segundo plano', { id: 'pdf-gen' });
      setDownloading(false);
    }, 1500);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      
      {/* CABECERA & ACCIÓN DE RETORNO */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link 
            href="/invoices" 
            className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-900/60 transition-colors text-zinc-650 dark:text-zinc-300"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                {invoice.number}
              </h1>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold
                ${invoice.status === 'paid' ? 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-500/5 dark:text-emerald-450' : ''}
                ${invoice.status === 'sent' ? 'bg-amber-500/10 text-amber-600 dark:bg-amber-500/5 dark:text-amber-500' : ''}
                ${invoice.status === 'overdue' ? 'bg-red-500/10 text-red-600 dark:bg-red-500/5 dark:text-red-400' : ''}
                ${invoice.status === 'draft' ? 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400' : ''}
              `}>
                {invoice.statusLabel}
              </span>
            </div>
            <p className="text-sm text-zinc-550 dark:text-zinc-400 mt-1">
              Consulta técnica de facturación electrónica y pasarela de checkout integrada.
            </p>
          </div>
        </div>
      </div>

      {/* CONTENIDO DE DETALLE A DOS COLUMNAS */}
      <div className="grid gap-8 lg:grid-cols-3">
        
        {/* PANEL DE ACCIONES (1 COLUMNA) */}
        <div className="space-y-6">
          
          {/* CICLO DE VIDA DEL COBRO */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm space-y-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Ciclo de Vida de Facturación
            </h3>

            {/* BARRA DE PROGRESO DE HITOS */}
            <div className="relative pl-6 space-y-6 before:absolute before:inset-y-1 before:left-[11px] before:w-0.5 before:bg-zinc-100 dark:before:bg-zinc-900">
              {/* Borrador */}
              <div className="relative flex gap-3 text-sm">
                <span className={`absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black ${
                  invoice.status === 'draft' || invoice.status === 'sent' || invoice.status === 'paid' || invoice.status === 'overdue'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800'
                }`}>
                  1
                </span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Factura Creada</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Documento guardado en base de datos temporal</p>
                </div>
              </div>

              {/* Emitido */}
              <div className="relative flex gap-3 text-sm">
                <span className={`absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black ${
                  invoice.status === 'sent' || invoice.status === 'paid' || invoice.status === 'overdue'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800'
                }`}>
                  2
                </span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Emitido y Publicado</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Enviado al receptor e inscrito ante el SII</p>
                </div>
              </div>

              {/* Cobrado */}
              <div className="relative flex gap-3 text-sm">
                <span className={`absolute -left-[25px] flex items-center justify-center w-6 h-6 rounded-full border text-[10px] font-black ${
                  invoice.status === 'paid'
                    ? 'bg-emerald-500/10 border-emerald-500 text-emerald-500'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-400 dark:bg-zinc-900 dark:border-zinc-800'
                }`}>
                  3
                </span>
                <div>
                  <p className="font-semibold text-zinc-850 dark:text-zinc-200">Cobrado / Liquidado</p>
                  <p className="text-xs text-zinc-450 dark:text-zinc-550">Transacción aprobada y fondos acreditados</p>
                </div>
              </div>
            </div>
          </div>

          {/* PANEL DE OPERACIONES */}
          <div className="bg-white/95 dark:bg-[#0e1427]/70 backdrop-blur-md border border-zinc-100 dark:border-zinc-900/60 rounded-2xl p-6 shadow-sm space-y-4">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">Operaciones Disponibles</h3>
            
            {/* Si no está pagada */}
            {invoice.status !== 'paid' && (
              <div className="space-y-3">
                {/* Pago MercadoPago */}
                <button 
                  onClick={() => triggerOnlinePayment('mercadopago')}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-sky-500 to-sky-600 hover:from-sky-400 hover:to-sky-500 text-white font-bold rounded-xl shadow-lg shadow-sky-500/10 hover:shadow-sky-500/25 transition-all duration-200 cursor-pointer text-sm"
                >
                  <CreditCard className="w-4.5 h-4.5 animate-pulse" style={{ animationDuration: '3s' }} />
                  Pagar con Mercado Pago
                </button>

                {/* Pago PayPal */}
                <button 
                  onClick={() => triggerOnlinePayment('paypal')}
                  className="w-full flex items-center justify-center gap-2.5 py-3 px-4 bg-gradient-to-r from-[#ffc439] to-[#ffb300] hover:from-[#ffd269] hover:to-[#ffc439] text-blue-900 font-black rounded-xl shadow-lg shadow-amber-500/10 hover:shadow-amber-500/25 transition-all duration-200 cursor-pointer text-sm relative overflow-hidden group"
                >
                  <span className="tracking-tight italic text-base">Pay<span className="text-[#003087]">Pal</span></span>
                </button>

                {/* Pago Manual */}
                <button 
                  onClick={handleMarkAsPaid}
                  className="w-full flex items-center justify-center gap-2.5 py-2 px-4 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-250 font-bold rounded-xl transition-all cursor-pointer text-xs"
                >
                  <CheckCircle className="w-4 h-4 text-emerald-550" />
                  Registrar Pago Manual
                </button>
              </div>
            )}

            {/* Descarga PDF */}
            <button 
              onClick={handleDownload}
              disabled={downloading}
              className="w-full flex items-center justify-center gap-2.5 py-3 px-4 border border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-250 font-bold rounded-xl transition-all cursor-pointer text-sm disabled:opacity-50"
            >
              {downloading ? (
                <Loader2 className="w-4.5 h-4.5 animate-spin" />
              ) : (
                <Download className="w-4.5 h-4.5 text-primary" />
              )}
              Descargar PDF Correlativo
            </button>

            <div className="h-px bg-zinc-100 dark:bg-zinc-900 my-2" />

            {/* Eliminar */}
            <button 
              onClick={handleDelete}
              className="w-full flex items-center justify-center gap-2.5 py-2.5 px-4 bg-red-500/5 hover:bg-red-500/10 text-red-650 dark:text-red-400 font-semibold border border-red-200 dark:border-red-950/80 rounded-xl transition-all cursor-pointer text-sm"
            >
              <Trash2 className="w-4.5 h-4.5" />
              Anular Documento
            </button>
          </div>

        </div>

        {/* VISOR DE FACTURA FÍSICA TIMBRADA POR SII (2 COLUMNAS) */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="relative bg-white text-zinc-900 rounded-2xl shadow-xl border-t-8 border-primary overflow-hidden p-8 sm:p-12 border border-zinc-200/60 font-sans leading-relaxed">
            
            {/* Timbrado de agua simulado */}
            {invoice.status === 'paid' && (
              <div className="absolute top-1/3 left-1/3 border-[6px] border-emerald-500/30 text-emerald-500/30 rounded-2xl font-black text-6xl tracking-widest p-6 uppercase -rotate-12 pointer-events-none select-none">
                PAGADO
              </div>
            )}
            
            {/* CABECERA DOCUMENTO */}
            <div className="flex flex-col gap-6 sm:flex-row sm:justify-between items-start border-b-2 border-zinc-250 pb-8">
              {/* Emisor Info */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center text-white font-bold text-base shadow-sm">F</div>
                  <span className="text-xl font-bold tracking-tight text-zinc-950">FacturaSaaS SpA</span>
                </div>
                <p className="text-[11px] text-zinc-550 leading-relaxed font-semibold max-w-[280px]">
                  Servicios TI Profesionales e Integración API Cloud.<br />
                  Avenida Apoquindo 4500, Oficina 801,<br />
                  Las Condes, Santiago, Chile.<br />
                  Email: soporte@facturasaas.cl
                </p>
              </div>

              {/* Recuadro Rojo de Factura SII (Chile) */}
              <div className="border-[3px] border-red-500 bg-white p-5 rounded-md text-center w-full sm:w-[240px] shrink-0 font-bold">
                <p className="text-red-500 font-mono text-sm tracking-wider">R.U.T. 77.654.321-K</p>
                <p className="text-red-500 uppercase font-bold text-xs my-2.5 tracking-tight leading-relaxed">Factura Electrónica</p>
                <p className="text-red-500 font-mono text-base">{invoice.number}</p>
              </div>
            </div>

            {/* FECHAS & RESUMEN SII */}
            <div className="grid gap-4 sm:grid-cols-2 text-xs border-b border-zinc-200 py-6">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-500 font-medium block">Fecha de Emisión</span>
                  <span className="font-bold text-zinc-850 block mt-0.5">{invoice.issueDate}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-zinc-400" />
                <div>
                  <span className="text-zinc-500 font-medium block">Fecha de Vencimiento</span>
                  <span className="font-bold text-zinc-850 block mt-0.5">{invoice.dueDate}</span>
                </div>
              </div>
            </div>

            {/* DATOS DEL RECEPTOR */}
            <div className="py-6 border-b border-zinc-200 space-y-4">
              <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Identificación del Receptor</h4>
              
              <div className="grid gap-4 sm:grid-cols-2 text-xs">
                <div className="space-y-2">
                  <p><span className="text-zinc-500 font-medium">Señor(es):</span> <span className="font-bold text-zinc-950">{invoice.client}</span></p>
                  <p><span className="text-zinc-500 font-medium">R.U.T.:</span> <span className="font-mono font-bold text-zinc-900">{clientInfo?.taxId || 'RUT: 76.543.210-9'}</span></p>
                  <p><span className="text-zinc-500 font-medium">Giro:</span> <span className="font-semibold text-zinc-850">Servicios Tecnológicos y Consultoría TI</span></p>
                </div>
                <div className="space-y-2">
                  <p><span className="text-zinc-500 font-medium">Dirección:</span> <span className="font-semibold text-zinc-850">{clientInfo?.address || 'Av. Vitacura 2670, Santiago'}</span></p>
                  <p><span className="text-zinc-500 font-medium">Contacto:</span> <span className="text-primary hover:underline font-semibold">{clientInfo?.email || 'facturas@cliente.com'}</span></p>
                  <p><span className="text-zinc-500 font-medium">Fono Enlace:</span> <span className="font-semibold text-zinc-850">{clientInfo?.phone || '+56 9 8765 4321'}</span></p>
                </div>
              </div>
            </div>

            {/* TABLA DE DETALLES CONCEPTOS */}
            <div className="py-6">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b-2 border-zinc-350 bg-zinc-50 text-[10px] font-bold text-zinc-500 uppercase tracking-wider">
                    <th className="py-3 px-3">Descripción de Productos o Servicios</th>
                    <th className="py-3 px-3 text-center">Cantidad</th>
                    <th className="py-3 px-3 text-right">Precio Unitario</th>
                    <th className="py-3 px-3 text-right">Monto</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 text-zinc-850 font-medium">
                  {invoice.items && invoice.items.length > 0 ? (
                    invoice.items.map((item, index) => (
                      <tr key={index}>
                        <td className="py-4 px-3 text-zinc-950 font-bold leading-normal max-w-[280px]">
                          {item.description}
                        </td>
                        <td className="py-4 px-3 text-center font-bold">{item.quantity}</td>
                        <td className="py-4 px-3 text-right">${Math.round(item.unitPrice).toLocaleString()}</td>
                        <td className="py-4 px-3 text-right text-zinc-950 font-bold">
                          ${Math.round(item.quantity * item.unitPrice).toLocaleString()}
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td className="py-4 px-3 text-zinc-950 font-bold leading-normal">
                        Servicios de Consultoría Tecnológica TI
                      </td>
                      <td className="py-4 px-3 text-center font-bold">1</td>
                      <td className="py-4 px-3 text-right">${Math.round(invoice.subtotal).toLocaleString()}</td>
                      <td className="py-4 px-3 text-right text-zinc-950 font-bold">
                        ${Math.round(invoice.subtotal).toLocaleString()}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* LIQUIDACIÓN DE TOTALES */}
            <div className="flex flex-col sm:flex-row sm:justify-between items-start gap-6 border-t-2 border-zinc-250 pt-6">
              
              {/* Notas Legales */}
              <div className="text-[10px] text-zinc-500 max-w-[340px] leading-relaxed">
                <p className="font-bold">Información de Ley:</p>
                <p className="mt-1">
                  El acuse de recibo de mercaderías entregadas o servicios prestados que se declara en este acto, es conforme con el Artículo 4° y 5° de la Ley N° 19.983 de Facturación Electrónica en la República de Chile.
                </p>
              </div>

              {/* Desglose Matemático */}
              <div className="w-full sm:w-[240px] text-xs font-semibold space-y-2 shrink-0">
                <div className="flex justify-between">
                  <span className="text-zinc-550">Monto Neto:</span>
                  <span className="text-zinc-900 font-bold">${Math.round(invoice.subtotal).toLocaleString()}</span>
                </div>
                {invoice.discount && invoice.discount > 0 ? (
                  <div className="flex justify-between text-red-650">
                    <span>Descuento Aplicado:</span>
                    <span>-${Math.round(invoice.discount).toLocaleString()}</span>
                  </div>
                ) : null}
                <div className="flex justify-between">
                  <span className="text-zinc-550">I.V.A. (19%):</span>
                  <span className="text-zinc-900 font-bold">${Math.round(invoice.tax).toLocaleString()}</span>
                </div>
                <div className="h-px bg-zinc-200 my-1" />
                <div className="flex justify-between text-base text-zinc-950 font-black">
                  <span>Total CLP:</span>
                  <span>${Math.round(invoice.amount).toLocaleString()}</span>
                </div>
              </div>
            </div>

            {/* TIMBRE ELECTRÓNICO SII (Chilean TED) */}
            <div className="mt-10 border-t border-zinc-200 pt-8 flex flex-col items-center justify-center gap-4">
              {/* Código de barras simulado DTE */}
              <div className="border border-zinc-350 p-2.5 bg-zinc-50 flex flex-col items-center">
                <div className="w-full sm:w-[320px] h-[55px] bg-[repeating-linear-gradient(90deg,black,black_2px,transparent_2px,transparent_6px,black_6px,black_10px,transparent_10px,transparent_12px)] opacity-85" />
                <div className="text-[9px] font-mono text-zinc-500 mt-2 uppercase tracking-tight">
                  Timbre Electrónico DTE - Res. SII N° 80 de 2026 - Verifique Documento
                </div>
              </div>
            </div>

          </div>

        </div>

      </div>

      {/* OVERLAY DE PASARELA DE CHECKOUT DUAL (MERCADOPAGO & PAYPAL) */}
      {checkoutOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="relative w-full max-w-md bg-white border border-zinc-200 rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 text-zinc-900">
            
            {/* Cabecera dinámica según Gateway */}
            {selectedGateway === 'paypal' ? (
              <div className="bg-[#003087] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 font-bold tracking-tight">
                  <ShieldCheck className="w-5 h-5 text-[#00c4ff]" />
                  <span className="italic font-black text-lg">Pay<span className="text-[#00c4ff]">Pal</span></span>
                  <span className="text-[10px] uppercase font-bold tracking-wider ml-1 bg-white/10 px-2 py-0.5 rounded">Checkout</span>
                </div>
                <button 
                  onClick={() => setCheckoutOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                  disabled={paymentStep === 'processing'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            ) : (
              <div className="bg-[#00aae4] p-4 text-white flex items-center justify-between">
                <div className="flex items-center gap-2 font-black tracking-tight">
                  <Smartphone className="w-5 h-5 animate-pulse" />
                  <span>Mercado Pago</span>
                  <span className="text-[9px] uppercase font-bold tracking-wider ml-1 bg-white/15 px-1.5 py-0.5 rounded">Pasarela Chile</span>
                </div>
                <button 
                  onClick={() => setCheckoutOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-white transition-colors"
                  disabled={paymentStep === 'processing'}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            )}

            {/* CUERPO DEL CHECKOUT */}
            <div className="p-6">
              
              {paymentStep === 'details' && (
                <div className="space-y-6">
                  {/* Resumen del Concepto */}
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-150 text-sm">
                    <span className="text-xs text-zinc-450 font-bold block">Cobrador de Factura</span>
                    <span className="font-bold text-zinc-800 text-base block mt-0.5">FacturaSaaS SpA</span>
                    <div className="h-px bg-zinc-200 my-3" />
                    
                    {selectedGateway === 'paypal' ? (
                      <div className="space-y-2">
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Monto Factura (CLP):</span>
                          <span className="font-bold text-zinc-700">${invoice.amount.toLocaleString()} CLP</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-zinc-500">Tasa de Cambio:</span>
                          <span className="font-semibold text-zinc-650">1 USD = 920 CLP</span>
                        </div>
                        <div className="h-px bg-zinc-100 my-1" />
                        <div className="flex justify-between items-center">
                          <span className="text-zinc-900 font-bold text-xs">Total a pagar en USD:</span>
                          <span className="font-black text-[#003087] text-lg">
                            ${(invoice.amount / 920).toLocaleString(undefined, {minimumFractionDigits: 2, maximumFractionDigits: 2})} USD
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-zinc-500 font-bold">Concepto: Factura {invoice.number}</span>
                        <span className="font-bold text-zinc-900 text-sm">${invoice.amount.toLocaleString()} CLP</span>
                      </div>
                    )}
                  </div>

                  {/* Selector de Medios de Pago según Gateway */}
                  {selectedGateway === 'paypal' ? (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Medio de Pago PayPal</h4>
                      
                      <button 
                        onClick={() => setSelectedMethod('card')}
                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all ${
                          selectedMethod === 'card' 
                            ? 'border-[#003087] bg-blue-500/5 font-bold' 
                            : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <ShieldCheck className="w-5 h-5 text-[#003087]" />
                        <div>
                          <p className="text-xs text-zinc-900">Saldo PayPal o Cuenta Bancaria</p>
                          <p className="text-[10px] text-zinc-400 font-normal">Paga seguro con tu cuenta de PayPal</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setSelectedMethod('transfer')}
                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all ${
                          selectedMethod === 'transfer' 
                            ? 'border-[#003087] bg-blue-500/5 font-bold' 
                            : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <CardIcon className="w-5 h-5 text-amber-550" />
                        <div>
                          <p className="text-xs text-zinc-900">Tarjeta de Crédito Internacional</p>
                          <p className="text-[10px] text-zinc-400 font-normal">Visa, Mastercard, American Express, Discover</p>
                        </div>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Selecciona Medio de Pago</h4>
                      
                      <button 
                        onClick={() => setSelectedMethod('card')}
                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all ${
                          selectedMethod === 'card' 
                            ? 'border-[#00aae4] bg-sky-500/5 font-bold' 
                            : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <CardIcon className="w-5 h-5 text-[#00aae4]" />
                        <div>
                          <p className="text-xs text-zinc-900">Tarjeta de Crédito / Débito</p>
                          <p className="text-[10px] text-zinc-400 font-normal">Hasta 12 cuotas sin interés</p>
                        </div>
                      </button>

                      <button 
                        onClick={() => setSelectedMethod('transfer')}
                        className={`w-full flex items-center gap-3 p-3.5 border rounded-xl text-left transition-all ${
                          selectedMethod === 'transfer' 
                            ? 'border-[#00aae4] bg-sky-500/5 font-bold' 
                            : 'border-zinc-200 hover:bg-zinc-50'
                        }`}
                      >
                        <Smartphone className="w-5 h-5 text-emerald-550" />
                        <div>
                          <p className="text-xs text-zinc-900">Transferencia Electrónica (Webpay/Khipu)</p>
                          <p className="text-[10px] text-zinc-400 font-normal">Acreditación instantánea 100% segura</p>
                        </div>
                      </button>
                    </div>
                  )}

                  {/* Aviso de Seguridad */}
                  <div className="flex items-center gap-2 p-3 bg-emerald-500/5 border border-emerald-500/10 rounded-xl text-[10px] text-emerald-700">
                    <ShieldCheck className="w-4 h-4 shrink-0" />
                    <span>Tu transacción cuenta con cifrado SSL bancario e inspección antifraude activa.</span>
                  </div>

                  {/* Botón Pagar Dinámico */}
                  {selectedGateway === 'paypal' ? (
                    <button 
                      onClick={executeSimulatedPayment}
                      className="w-full py-3 bg-[#ffc439] hover:bg-[#ffb300] active:scale-[0.98] text-[#003087] font-extrabold rounded-xl shadow-lg shadow-amber-500/10 transition-all cursor-pointer text-sm flex items-center justify-center gap-1.5"
                    >
                      Pagar con <span className="italic font-black">PayPal</span> USD
                    </button>
                  ) : (
                    <button 
                      onClick={executeSimulatedPayment}
                      className="w-full py-3 bg-[#00aae4] hover:bg-[#009bd1] active:scale-[0.98] text-white font-bold rounded-xl shadow-lg shadow-sky-500/20 transition-all cursor-pointer text-sm"
                    >
                      Confirmar y Pagar ${invoice.amount.toLocaleString()} CLP
                    </button>
                  )}
                </div>
              )}

              {paymentStep === 'processing' && (
                <div className="py-12 flex flex-col items-center justify-center gap-4 text-center">
                  <Loader2 className={`w-10 h-10 animate-spin ${selectedGateway === 'paypal' ? 'text-[#003087]' : 'text-[#00aae4]'}`} />
                  <div>
                    <h4 className="font-bold text-zinc-900">
                      {selectedGateway === 'paypal' ? 'Conectando de forma segura con PayPal...' : 'Procesando transacción bancaria...'}
                    </h4>
                    <p className="text-xs text-zinc-500 mt-1">Espera un momento, no cierres la ventana.</p>
                  </div>
                </div>
              )}

              {paymentStep === 'success' && (
                <div className="py-8 flex flex-col items-center justify-center gap-4 text-center animate-in zoom-in-95 duration-300">
                  <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-550 flex items-center justify-center animate-bounce">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-zinc-950 text-lg">¡Pago Recibido Exitosamente!</h4>
                    <p className="text-xs text-zinc-500 mt-1 max-w-[285px] leading-relaxed mx-auto">
                      {selectedGateway === 'paypal' 
                        ? 'La factura ha sido liquidada en el sistema mediante PayPal. Recibirás tu acuse de recibo y comprobante en USD.' 
                        : 'La factura ha sido liquidada en el sistema mediante Mercado Pago. Recibirás tu comprobante tributario y acuse de recibo del SII en tu correo.'}
                    </p>
                  </div>
                  <button 
                    onClick={() => setCheckoutOpen(false)}
                    className="mt-4 px-6 py-2 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl text-sm transition-all shadow-md shadow-emerald-500/15"
                  >
                    Volver a la Factura
                  </button>
                </div>
              )}

            </div>

          </div>
        </div>
      )}

    </div>
  );
}
