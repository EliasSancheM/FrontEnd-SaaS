'use client';

import React from 'react';

export function FieldGroup({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="space-y-1.5">
      <label className="block text-sm font-semibold text-zinc-700 dark:text-zinc-300">
        {label}
      </label>
      {description && (
        <p className="text-xs text-zinc-400 dark:text-zinc-500">{description}</p>
      )}
      <div className="mt-1">{children}</div>
    </div>
  );
}

export function TextInput({ 
  value, onChange, placeholder, icon: Icon, type = 'text', disabled = false 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  icon?: React.ComponentType<{ className?: string }>;
  type?: string;
  disabled?: boolean;
}) {
  return (
    <div className="relative group">
      {Icon && (
        <div className="absolute inset-y-0 left-0 flex items-center pl-3.5 pointer-events-none">
          <Icon className="w-4 h-4 text-zinc-400 dark:text-zinc-500 group-focus-within:text-primary transition-colors" />
        </div>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className={`
          w-full rounded-xl border border-zinc-200 dark:border-zinc-800 
          bg-zinc-50/50 dark:bg-zinc-900/50 
          text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600
          focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
          transition-all duration-200
          disabled:opacity-50 disabled:cursor-not-allowed
          ${Icon ? 'pl-10' : 'pl-4'} pr-4 py-3
        `}
      />
    </div>
  );
}

export function TextAreaInput({ 
  value, onChange, placeholder, rows = 3 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  placeholder?: string; 
  rows?: number;
}) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      rows={rows}
      className="
        w-full rounded-xl border border-zinc-200 dark:border-zinc-800 
        bg-zinc-50/50 dark:bg-zinc-900/50 
        text-sm text-zinc-900 dark:text-white placeholder-zinc-400 dark:placeholder-zinc-600
        focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary
        transition-all duration-200 px-4 py-3 resize-none
      "
    />
  );
}
