import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import type { Client, ClientStatus, Paginated } from './types';

export interface ClientInput {
  name: string;
  rut?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  status?: ClientStatus;
  notes?: string | null;
}

const clientsKey = ['clients'] as const;

/** Lista de clientes del tenant autenticado (primera página de la API). */
export function useClients() {
  return useQuery({
    queryKey: clientsKey,
    queryFn: async (): Promise<Client[]> => {
      const { data } = await api.get<Paginated<Client>>('/clients');
      return data.data;
    },
  });
}

/** Un cliente por id, con sus facturas asociadas si la API las incluye. */
export function useClient(id: number | string | undefined) {
  return useQuery({
    queryKey: ['clients', Number(id)],
    enabled: id !== undefined && id !== null && id !== '',
    queryFn: async (): Promise<Client> => {
      const { data } = await api.get<Client>(`/clients/${id}`);
      return data;
    },
  });
}

export function useCreateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ClientInput): Promise<Client> => {
      const { data } = await api.post<Client>('/clients', input);
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsKey }),
  });
}

export function useUpdateClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: number; input: ClientInput }): Promise<Client> => {
      const { data } = await api.put<Client>(`/clients/${id}`, input);
      return data;
    },
    onSuccess: (client) => {
      qc.invalidateQueries({ queryKey: clientsKey });
      qc.invalidateQueries({ queryKey: ['clients', client.id] });
    },
  });
}

export function useDeleteClient() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: number): Promise<void> => {
      await api.delete(`/clients/${id}`);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: clientsKey }),
  });
}
