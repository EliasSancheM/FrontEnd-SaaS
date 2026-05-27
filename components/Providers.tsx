'use client';

import React, { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

/**
 * Proveedor global de contextos cliente.
 * Envuelve la app con QueryClientProvider de TanStack Query
 * para habilitar fetching declarativo, caché y sincronización con la API.
 */
export default function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 60 * 1000,        // Los datos se consideran frescos por 1 minuto
            retry: 1,                     // Reintentar una vez en caso de error de red
            refetchOnWindowFocus: false,   // No refetch al cambiar de pestaña
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  );
}
