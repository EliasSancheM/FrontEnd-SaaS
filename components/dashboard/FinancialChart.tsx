'use client';

import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

export interface ChartDataPoint {
  month: string;
  ingresos: number;
  gastos: number;
}

interface FinancialChartProps {
  data: ChartDataPoint[];
}

/**
 * Tooltip personalizado con glassmorphism para el gráfico financiero.
 */
function CustomTooltip({ active, payload, label }: { active?: boolean; payload?: Array<{ name: string; value: number; color: string }>; label?: string }) {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-zinc-200 dark:border-zinc-800 rounded-xl p-3.5 shadow-2xl text-xs min-w-[160px]">
      <p className="font-bold text-zinc-900 dark:text-white mb-2 text-[11px]">{label}</p>
      <div className="space-y-1.5">
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2 h-2 rounded-full shrink-0"
                style={{ backgroundColor: entry.color }}
              />
              <span className="text-zinc-500 dark:text-zinc-400 capitalize">{entry.name}</span>
            </div>
            <span className="font-bold text-zinc-900 dark:text-white tabular-nums">
              ${entry.value.toLocaleString('es-CL')}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Gráfico de área financiero con gradientes premium.
 * Muestra la tendencia de ingresos vs gastos mensuales con Recharts.
 */
export default function FinancialChart({ data }: FinancialChartProps) {
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <defs>
            {/* Gradiente para ingresos — Electric Indigo/Violet */}
            <linearGradient id="gradientIngresos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(250, 89%, 65%)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="hsl(250, 89%, 65%)" stopOpacity={0} />
            </linearGradient>
            {/* Gradiente para gastos — Neon Cyan */}
            <linearGradient id="gradientGastos" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="hsl(190, 90%, 50%)" stopOpacity={0.2} />
              <stop offset="95%" stopColor="hsl(190, 90%, 50%)" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            vertical={false}
            stroke="rgba(128, 128, 128, 0.08)"
          />

          <XAxis
            dataKey="month"
            fontSize={11}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
            stroke="hsl(215, 16%, 47%)"
            dy={8}
          />

          <YAxis
            fontSize={11}
            fontWeight={500}
            tickLine={false}
            axisLine={false}
            stroke="hsl(215, 16%, 47%)"
            tickFormatter={(value: number) => {
              if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`;
              if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`;
              return `$${value}`;
            }}
            dx={-4}
          />

          <Tooltip content={<CustomTooltip />} />

          {/* Línea de ingresos — prominente */}
          <Area
            type="monotone"
            dataKey="ingresos"
            stroke="hsl(250, 89%, 65%)"
            fillOpacity={1}
            fill="url(#gradientIngresos)"
            strokeWidth={2.5}
            dot={{ r: 3, fill: 'hsl(250, 89%, 65%)', strokeWidth: 0 }}
            activeDot={{ r: 5, fill: 'hsl(250, 89%, 65%)', strokeWidth: 2, stroke: 'white' }}
          />

          {/* Línea de gastos — secundaria con dashes */}
          <Area
            type="monotone"
            dataKey="gastos"
            stroke="hsl(190, 90%, 50%)"
            fillOpacity={1}
            fill="url(#gradientGastos)"
            strokeWidth={2}
            strokeDasharray="5 5"
            dot={{ r: 2.5, fill: 'hsl(190, 90%, 50%)', strokeWidth: 0 }}
            activeDot={{ r: 4, fill: 'hsl(190, 90%, 50%)', strokeWidth: 2, stroke: 'white' }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
