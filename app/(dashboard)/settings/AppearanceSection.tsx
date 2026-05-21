'use client';

import React from 'react';
import { Palette, Sun, Moon, Monitor, Sparkles, Check } from 'lucide-react';
import type { CompanySettings } from '@/lib/authStore';

const accentColors = [
  { id: 'emerald' as const, label: 'Esmeralda', class: 'bg-emerald-500', ring: 'ring-emerald-500/30' },
  { id: 'blue' as const, label: 'Azul', class: 'bg-blue-500', ring: 'ring-blue-500/30' },
  { id: 'violet' as const, label: 'Violeta', class: 'bg-violet-500', ring: 'ring-violet-500/30' },
  { id: 'amber' as const, label: 'Ámbar', class: 'bg-amber-500', ring: 'ring-amber-500/30' },
  { id: 'rose' as const, label: 'Rosa', class: 'bg-rose-500', ring: 'ring-rose-500/30' },
];

interface AppearanceSectionProps {
  form: CompanySettings;
  updateForm: (key: keyof CompanySettings, value: string | number) => void;
}

export default function AppearanceSection({ form, updateForm }: AppearanceSectionProps) {
  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-primary/10">
            <Palette className="w-5 h-5 text-primary" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Tema de la Interfaz</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Selecciona el modo de visualización preferido</p>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          {([
            { id: 'light' as const, label: 'Claro', icon: Sun, desc: 'Fondo blanco, texto oscuro' },
            { id: 'dark' as const, label: 'Oscuro', icon: Moon, desc: 'Fondo oscuro, texto claro' },
            { id: 'system' as const, label: 'Sistema', icon: Monitor, desc: 'Automático según tu SO' },
          ]).map((theme) => {
            const Icon = theme.icon;
            const isSelected = form.theme === theme.id;
            return (
              <button
                key={theme.id}
                onClick={() => updateForm('theme', theme.id)}
                className={`
                  relative flex flex-col items-center gap-3 p-5 rounded-xl border-2 transition-all duration-200 group cursor-pointer
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm shadow-primary/10' 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 bg-zinc-50/50 dark:bg-zinc-900/30'
                  }
                `}
              >
                {isSelected && (
                  <div className="absolute top-2.5 right-2.5 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                )}
                <div className={`p-3 rounded-xl transition-colors ${isSelected ? 'bg-primary/10 text-primary' : 'bg-zinc-100 dark:bg-zinc-800 text-zinc-500 group-hover:text-zinc-700 dark:group-hover:text-zinc-300'}`}>
                  <Icon className="w-6 h-6" />
                </div>
                <div className="text-center">
                  <p className={`text-sm font-bold ${isSelected ? 'text-primary' : 'text-zinc-700 dark:text-zinc-300'}`}>{theme.label}</p>
                  <p className="text-[11px] text-zinc-400 dark:text-zinc-500 mt-0.5">{theme.desc}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-xl bg-pink-500/10">
            <Sparkles className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Color de Acento</h3>
            <p className="text-xs text-zinc-400 dark:text-zinc-500">Color principal de la marca en la interfaz</p>
          </div>
        </div>

        <div className="flex flex-wrap gap-4">
          {accentColors.map((color) => {
            const isSelected = form.accentColor === color.id;
            return (
              <button
                key={color.id}
                onClick={() => updateForm('accentColor', color.id)}
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl border-2 transition-all duration-200 cursor-pointer
                  ${isSelected 
                    ? `border-current ${color.ring} ring-4 shadow-sm` 
                    : 'border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700'
                  }
                `}
              >
                <div className={`w-6 h-6 rounded-full ${color.class} shadow-inner ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-zinc-50 dark:ring-offset-[#0e0e0e]' : ''}`} />
                <span className={`text-sm font-semibold ${isSelected ? 'text-zinc-900 dark:text-white' : 'text-zinc-600 dark:text-zinc-400'}`}>{color.label}</span>
                {isSelected && <Check className="w-4 h-4 text-primary ml-1" />}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
