'use client';

import React, { useState } from 'react';
import { CreditCard, Save, CheckCircle2, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PaymentMethodsSection() {
  const [mercadoPagoEnabled, setMercadoPagoEnabled] = useState(false);
  const [paypalEnabled, setPaypalEnabled] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [mpKeys, setMpKeys] = useState({ publicKey: '', accessToken: '' });
  const [paypalKeys, setPaypalKeys] = useState({ clientId: '', clientSecret: '' });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 800));
    
    setIsSaving(false);
    toast.success('Métodos de pago actualizados correctamente', {
      icon: '💳',
      style: { 
        background: '#0e0e0e', 
        color: '#fff', 
        border: '1px solid rgba(16,185,129,0.2)',
        borderRadius: '12px'
      },
    });
  };

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="bg-card rounded-2xl border border-border overflow-hidden shadow-sm">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-primary/10 rounded-xl text-primary">
              <CreditCard className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-foreground">Métodos de Pago</h2>
              <p className="text-sm text-muted-foreground mt-0.5">
                Configura las pasarelas de pago para cobrar tus facturas en línea.
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-8">
          
          {/* MercadoPago Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#009EE3]/10 flex items-center justify-center">
                  <span className="text-[#009EE3] font-bold text-lg">MP</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">MercadoPago</h3>
                  <p className="text-xs text-muted-foreground">Recibe pagos con tarjetas locales y saldo MP.</p>
                </div>
              </div>
              <button 
                onClick={() => setMercadoPagoEnabled(!mercadoPagoEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${mercadoPagoEnabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${mercadoPagoEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {mercadoPagoEnabled && (
              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-4 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Public Key</label>
                    <input 
                      type="text" 
                      value={mpKeys.publicKey}
                      onChange={(e) => setMpKeys({...mpKeys, publicKey: e.target.value})}
                      placeholder="APP_USR-..." 
                      className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Access Token</label>
                    <input 
                      type="password" 
                      value={mpKeys.accessToken}
                      onChange={(e) => setMpKeys({...mpKeys, accessToken: e.target.value})}
                      placeholder="APP_USR-..." 
                      className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Asegúrate de usar credenciales de producción para cobrar a clientes reales.
                </div>
              </div>
            )}
          </div>

          <div className="h-px w-full bg-border" />

          {/* PayPal Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-[#00457C]/10 flex items-center justify-center">
                  <span className="text-[#00457C] font-bold text-lg italic">P</span>
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">PayPal</h3>
                  <p className="text-xs text-muted-foreground">Recibe pagos internacionales en dólares.</p>
                </div>
              </div>
              <button 
                onClick={() => setPaypalEnabled(!paypalEnabled)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${paypalEnabled ? 'bg-primary' : 'bg-secondary'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${paypalEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
              </button>
            </div>

            {paypalEnabled && (
              <div className="p-4 rounded-xl border border-border bg-background/50 space-y-4 animate-fade-in-up">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Client ID</label>
                    <input 
                      type="text" 
                      value={paypalKeys.clientId}
                      onChange={(e) => setPaypalKeys({...paypalKeys, clientId: e.target.value})}
                      placeholder="AdX..." 
                      className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">Secret Key</label>
                    <input 
                      type="password" 
                      value={paypalKeys.clientSecret}
                      onChange={(e) => setPaypalKeys({...paypalKeys, clientSecret: e.target.value})}
                      placeholder="EPa..." 
                      className="w-full px-3 py-2 text-sm bg-card border border-border rounded-lg text-foreground focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                    />
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-muted-foreground bg-primary/5 p-3 rounded-lg border border-primary/10">
                  <AlertCircle className="w-4 h-4 text-primary" />
                  Las comisiones de PayPal se aplicarán según tu país de residencia.
                </div>
              </div>
            )}
          </div>
          
        </div>
        
        <div className="p-6 border-t border-border bg-secondary/30 flex justify-end">
          <button
            onClick={handleSave}
            disabled={isSaving}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground font-semibold shadow-md hover:shadow-lg transition-all hover:-translate-y-0.5 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isSaving ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            Guardar Configuración
          </button>
        </div>
      </div>
    </div>
  );
}
