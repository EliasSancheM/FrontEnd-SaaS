'use client';

import React, { useState } from 'react';
import { RotateCcw, Trash2, AlertTriangle, CircleAlert } from 'lucide-react';

interface DangerSectionProps {
  isSaving: boolean;
  onResetSettings: () => Promise<void>;
  onWipeData: () => Promise<void>;
}

export default function DangerSection({ isSaving, onResetSettings, onWipeData }: DangerSectionProps) {
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [showWipeConfirm, setShowWipeConfirm] = useState(false);

  const handleReset = async () => {
    await onResetSettings();
    setShowResetConfirm(false);
  };

  const handleWipe = async () => {
    await onWipeData();
    setShowWipeConfirm(false);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
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
          <button onClick={() => setShowResetConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-800 bg-amber-500/5 hover:bg-amber-500/10 text-amber-700 dark:text-amber-400 text-sm font-semibold transition-all">
            <RotateCcw className="w-4 h-4" />
            Restaurar valores predeterminados
          </button>
        ) : (
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-900/40">
            <CircleAlert className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0" />
            <p className="text-sm text-amber-800 dark:text-amber-300 font-medium flex-1">¿Estás seguro? Se perderán todos tus ajustes personalizados.</p>
            <div className="flex gap-2 shrink-0">
              <button onClick={() => setShowResetConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
              <button onClick={handleReset} disabled={isSaving} className="px-3 py-1.5 rounded-lg bg-amber-500 text-white text-xs font-bold hover:bg-amber-600 transition-colors disabled:opacity-50">{isSaving ? 'Restaurando...' : 'Confirmar'}</button>
            </div>
          </div>
        )}
      </div>

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
          <button onClick={() => setShowWipeConfirm(true)} className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-red-300 dark:border-red-800 bg-red-500/5 hover:bg-red-500/10 text-red-700 dark:text-red-400 text-sm font-semibold transition-all">
            <Trash2 className="w-4 h-4" />
            Eliminar todos los datos
          </button>
        ) : (
          <div className="flex flex-col gap-3 p-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900/40">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0" />
              <p className="text-sm text-red-800 dark:text-red-300 font-medium">⚠️ Esta acción no se puede deshacer. Todos los clientes y facturas serán eliminados.</p>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => setShowWipeConfirm(false)} className="px-3 py-1.5 rounded-lg text-xs font-semibold text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">Cancelar</button>
              <button onClick={handleWipe} disabled={isSaving} className="px-3 py-1.5 rounded-lg bg-red-600 text-white text-xs font-bold hover:bg-red-700 transition-colors disabled:opacity-50">{isSaving ? 'Eliminando...' : 'Eliminar Todo'}</button>
            </div>
          </div>
        )}
      </div>

      <div className="flex items-start gap-3 p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/30 border border-zinc-100 dark:border-zinc-800">
        <CircleAlert className="w-5 h-5 text-zinc-400 shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">Nota sobre los datos</p>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 leading-relaxed">Actualmente, los datos de clientes y facturas se almacenan localmente en tu navegador (localStorage). Cuando conectes el backend de Laravel, esta sección se actualizará para gestionar datos reales del servidor con confirmaciones de eliminación seguras.</p>
        </div>
      </div>
    </div>
  );
}
