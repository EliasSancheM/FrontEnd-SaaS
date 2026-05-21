# 🎨 SaaS de Facturación para PYMEs - Resumen Técnico del Frontend (Next.js 16.2 & Astro)

Este documento detalla la arquitectura completa de frontend, la estructura de directorios, la gestión del estado, las integraciones de API y la guía de diseño premium para la **Landing Page** (Astro) y la **Aplicación SaaS** (Next.js 16.2).

---

## 🛠️ Stack Tecnológico & Decisiones Clave

| Módulo | Tecnología | Justificación de Arquitectura |
| :--- | :--- | :--- |
| **Sitio de Marketing** | **Astro 4+** | Sitios estáticos puros, máxima velocidad de carga (100/100 Lighthouse), SEO óptimo y arquitectura de "islas" si requerimos interactividad ligera. |
| **Aplicación SaaS** | **Next.js 16.2** (React 19) | Lo último en frameworks React. Servido con **Turbopack** para desarrollo ultra-rápido, Server Actions y renderizado híbrido (SSR/CSR). |
| **Diseño y Estilos** | **Tailwind CSS v4** | Estilizado moderno impulsado por el nuevo motor que compila nativamente en CSS, reduciendo tiempos de build y optimizando las variables HSL. |
| **Estado Global** | **Zustand** | Gestor de estado superligero para manejar estados del sidebar, configuraciones de UI y caché efímera del usuario. |
| **Peticiones & Caché**| **TanStack Query (v5)** | Para fetching, sincronización, reintentos y caché de datos de la API de Laravel de forma declarativa. |
| **Formularios** | **React Hook Form** + **Zod** | Manejo de formularios dinámicos de facturas de alto rendimiento con validación de esquemas en tiempo real. |
| **Gráficos** | **Recharts** | Visualizaciones interactivas de datos financieros responsivas y estilizadas con gradientes CSS. |

---

## 📂 Estructura del Proyecto (SaaS App - Next.js 16.2)

Implementamos una estructura orientada a **Features (características)** para mantener el código desacoplado y altamente escalable en producción:

```
c:\Users\sanch\OneDrive\Desktop\FrontEnd-SaaS\
├── app/
│   ├── (auth)/
│   │   ├── login/page.tsx         # Pantalla de Login
│   │   └── register/page.tsx      # Registro + Onboarding inicial
│   ├── (dashboard)/
│   │   ├── layout.tsx             # Sidebar premium, Topbar, Tenant Selector
│   │   ├── page.tsx               # Métricas e ingresos (Recharts)
│   │   ├── clients/
│   │   │   ├── page.tsx           # Tabla de clientes con buscador y filtros
│   │   │   └── [id]/page.tsx      # Ficha del cliente y facturas históricas
│   │   └── invoices/
│   │       ├── page.tsx           # Historial general de facturas
│   │       ├── create/page.tsx    # Formulario dinámico de facturación
│   │       └── [id]/page.tsx      # Detalle de factura y visualización PDF
│   ├── globals.css                # Estilos Tailwind v4 y variables CSS HSL
│   └── layout.tsx                 # Root layout, Proveedores de Query y Contextos
├── components/
│   ├── ui/                        # Componentes reutilizables (Botón, Input, Modal, Tabla)
│   ├── dashboard/                 # Sidebar, Header del dashboard
│   └── shared/                    # Layouts, Loading states, Error boundaries
├── features/
│   ├── auth/                      # Hooks y utilidades de sesión
│   ├── clients/                   # Estado y llamadas API de Clientes
│   └── invoices/                  # Lógica de cálculo dinámico de totales e ítems
├── hooks/
│   └── useMediaQuery.ts           # Hooks globales de utilidad
├── lib/
│   ├── api.ts                     # Instancia Axios / Fetch configurada con interceptores
│   └── utils.ts                   # Funciones utilitarias (formateadores de dinero, etc.)
└── package.json
```

---

## 🎨 Sistema de Diseño Premium (Tailwind v4)

Para ofrecer una experiencia de usuario sumamente pulida, moderna y profesional, implementamos una paleta de colores HSL refinada que resalta los elementos de negocio y soporta modo oscuro de forma fluida.

### Configuración en `app/globals.css` (Tailwind v4 native)

```css
@import "tailwindcss";

@theme {
  /* Paleta Premium basada en Slate & Esmeralda */
  --color-border: hsl(214.3 31.8% 91.4%);
  --color-input: hsl(214.3 31.8% 91.4%);
  --color-ring: hsl(142.1 76.2% 36.3%);
  --color-background: hsl(0 0% 100%);
  --color-foreground: hsl(222.2 84% 4.9%);

  --color-primary: hsl(142.1 76.2% 36.3%); /* Emerald Premium */
  --color-primary-foreground: hsl(355.7 100% 97.3%);

  --color-secondary: hsl(210 40% 96.1%);
  --color-secondary-foreground: hsl(222.2 47.4% 11.2%);

  --color-card: hsl(0 0% 100%);
  --color-card-foreground: hsl(222.2 84% 4.9%);
  
  --color-muted: hsl(210 40% 96.1%);
  --color-muted-foreground: hsl(215.4 16.3% 46.9%);

  --animate-accordion-down: accordion-down 0.2s ease-out;
  --animate-accordion-up: accordion-up 0.2s ease-out;
}

@media (prefers-color-scheme: dark) {
  @theme {
    --color-background: hsl(222.2 84% 4.9%);
    --color-foreground: hsl(210 40% 98%);
    --color-card: hsl(222.2 84% 4.9%);
    --color-card-foreground: hsl(210 40% 98%);
    --color-border: hsl(217.2 32.6% 17.5%);
    --color-primary: hsl(142.1 70.6% 45.3%);
    --color-muted: hsl(217.2 32.6% 17.5%);
    --color-muted-foreground: hsl(215 20.2% 65.1%);
  }
}
```

---

## 🛠️ Conexión con Laravel 13 API (Auth & Cookies)

En Next.js 16.2, nos conectamos a Laravel 13 mediante el cliente HTTP Axios configurado para soportar cookies de sesión y tokens de autenticación de forma segura:

```typescript
// lib/api.ts
import axios from 'axios';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1',
  withCredentials: true, // Requerido para Laravel Sanctum cookies/tokens
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Interceptor para inyectar el Token en caso de usar tokens directos (Bearer)
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

---

## 📋 Implementación de Características Clave

### 1. Formulario de Factura Dinámico (React Hook Form)
La creación de facturas requiere añadir múltiples conceptos con cálculos automáticos de subtotal, impuestos y totales. Usamos `useFieldArray` para el desglose:

```typescript
// app/(dashboard)/invoices/create/page.tsx
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

const invoiceSchema = z.object({
  client_id: z.string().min(1, 'Selecciona un cliente'),
  issue_date: z.string(),
  due_date: z.string(),
  items: z.array(z.object({
    description: z.string().min(1, 'La descripción es requerida'),
    quantity: z.number().min(0.01, 'Min 0.01'),
    unit_price: z.number().min(0.01, 'Min 0.01'),
  })).min(1, 'Añade al menos un concepto'),
});

export default function CreateInvoicePage() {
  const { register, control, watch, handleSubmit } = useForm({
    resolver: zodResolver(invoiceSchema),
    defaultValues: { items: [{ description: '', quantity: 1, unit_price: 0 }] }
  });

  const { fields, append, remove } = useFieldArray({ control, name: 'items' });

  // Escuchar cambios para calcular totales dinámicamente en tiempo real
  const items = watch('items');
  const subtotal = items.reduce((acc, item) => acc + (item.quantity * item.unit_price || 0), 0);
  const tax = subtotal * 0.19; // Ejemplo tasa 19%
  const total = subtotal + tax;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* ... inputs de cabecera ... */}
      {fields.map((field, index) => (
        <div key={field.id} className="flex gap-4 items-center">
          <input {...register(`items.${index}.description`)} placeholder="Concepto" className="flex-1" />
          <input type="number" {...register(`items.${index}.quantity`, { valueAsNumber: true })} className="w-20" />
          <input type="number" {...register(`items.${index}.unit_price`, { valueAsNumber: true })} className="w-32" />
          <button type="button" onClick={() => remove(index)} className="text-red-500">Eliminar</button>
        </div>
      ))}
      <button type="button" onClick={() => append({ description: '', quantity: 1, unit_price: 0 })}>
        Añadir Item
      </button>
      <div className="text-right font-semibold">
        <p>Subtotal: ${subtotal.toLocaleString()}</p>
        <p>IVA (19%): ${tax.toLocaleString()}</p>
        <p className="text-xl text-primary">Total: ${total.toLocaleString()}</p>
      </div>
    </form>
  );
}
```

### 2. Dashboard Financiero (Recharts)
El panel principal muestra el comportamiento financiero mensual en gráficos estéticamente premium:

```typescript
// components/dashboard/FinancialChart.tsx
'use client';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

export function FinancialChart({ data }: { data: any[] }) {
  return (
    <div className="h-[300px] w-full bg-card p-4 rounded-2xl border border-border shadow-sm">
      <h3 className="text-lg font-semibold mb-4">Ingresos Mensuales</h3>
      <ResponsiveContainer width="100%" height="90%">
        <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-primary)" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="var(--color-primary)" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(0,0,0,0.05)" />
          <XAxis dataKey="month" stroke="var(--color-muted-foreground)" fontSize={12} />
          <YAxis stroke="var(--color-muted-foreground)" fontSize={12} />
          <Tooltip contentStyle={{ background: 'var(--color-card)', borderColor: 'var(--color-border)' }} />
          <Area type="monotone" dataKey="total" stroke="var(--color-primary)" fillOpacity={1} fill="url(#colorIncome)" strokeWidth={2} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
```

---

## 🚀 Integración y Webhooks de Pago
El flujo de checkout finaliza redirigiendo al usuario a la pasarela (MercadoPago/Stripe). Al regresar, procesamos la URL de retorno:

```typescript
// app/(dashboard)/invoices/[id]/page.tsx
'use client';
import { useSearchParams } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  const searchParams = useSearchParams();
  const status = searchParams.get('status');

  useEffect(() => {
    if (status === 'success') {
      toast.success('¡Pago procesado con éxito! Recibirás la confirmación en minutos.');
    } else if (status === 'failed') {
      toast.error('Hubo un inconveniente con el pago. Inténtalo de nuevo.');
    }
  }, [status]);

  return (
    <div>
      {/* Visualización de la factura y visor del PDF generado por Laravel */}
      <iframe src={`http://localhost:8000/api/v1/invoices/${params.id}/pdf`} className="w-full h-[600px] border rounded-xl" />
    </div>
  );
}
```

---

## 📅 Tareas de Desarrollo del Frontend (Pasos a Seguir)

1. **Configurar enrutamiento básico:** Crear rutas `app/(auth)` y `app/(dashboard)`.
2. **Definir Tema Tailwind v4:** Inyectar los colores y fuentes Geist en `globals.css`.
3. **Módulo de Autenticación:** Formularios de registro, login y persistencia con Zustand/localStorage.
4. **CRUD de Clientes y Tabla de Facturas:** Configurar TanStack Query para fetching y paginación reactiva.
5. **Creador de Facturas:** Implementar el formulario dinámico con cálculo automático en tiempo real.
6. **Visor de PDF e Integración de MercadoPago:** Integrar el modal o iframe del PDF y el redirect de checkout.
7. **Puesta a Punto de Estética:** Añadir transacciones fluidas y pulido visual con modo oscuro.
