'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Users,
  Plus,
  Search,
  X,
  Mail,
  Phone,
  MapPin,
  FileSpreadsheet,
  Edit2,
  Trash2,
  AlertCircle,
  Loader2,
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';
import { isAxiosError } from 'axios';
import { useClients, useCreateClient, useUpdateClient, useDeleteClient } from '@/lib/clients';
import type { Client } from '@/lib/types';

// Esquema de validación con Zod. Los nombres de campo coinciden con la API de Laravel.
const clientSchema = z.object({
  name: z.string().min(3, 'El nombre debe tener al menos 3 caracteres'),
  rut: z.string().min(5, 'El RUT / Identificador fiscal es requerido'),
  email: z.string().email('Ingresa un correo electrónico válido'),
  phone: z.string().min(8, 'El teléfono debe tener al menos 8 dígitos'),
  address: z.string().min(5, 'Ingresa una dirección completa'),
  status: z.enum(['active', 'inactive']),
});

type ClientFormValues = z.infer<typeof clientSchema>;

const toastStyle = {
  style: {
    background: 'var(--color-card)',
    color: 'var(--color-foreground)',
    border: '1px solid var(--color-border)',
  },
  iconTheme: {
    primary: 'var(--color-primary)',
    secondary: 'var(--color-primary-foreground)',
  },
};

export default function ClientsPage() {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  const { data: clients = [], isLoading, isError, refetch } = useClients();
  const createClient = useCreateClient();
  const updateClient = useUpdateClient();
  const deleteClient = useDeleteClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<ClientFormValues>({
    resolver: zodResolver(clientSchema),
    defaultValues: { status: 'active' },
  });

  const openCreate = () => {
    setEditingClient(null);
    reset({ name: '', rut: '', email: '', phone: '', address: '', status: 'active' });
    setIsModalOpen(true);
  };

  const openEdit = (client: Client) => {
    setEditingClient(client);
    reset({
      name: client.name,
      rut: client.rut ?? '',
      email: client.email ?? '',
      phone: client.phone ?? '',
      address: client.address ?? '',
      status: client.status,
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingClient(null);
  };

  const onSubmit = (data: ClientFormValues) => {
    if (editingClient) {
      updateClient.mutate(
        { id: editingClient.id, input: data },
        {
          onSuccess: () => {
            closeModal();
            toast.success('Cliente actualizado exitosamente', toastStyle);
          },
          onError: () => toast.error('No se pudo actualizar el cliente', toastStyle),
        }
      );
    } else {
      createClient.mutate(data, {
        onSuccess: () => {
          closeModal();
          toast.success('Cliente registrado exitosamente', toastStyle);
        },
        onError: () => toast.error('No se pudo registrar el cliente', toastStyle),
      });
    }
  };

  const handleDelete = (client: Client) => {
    if (!confirm(`¿Estás seguro de que deseas eliminar a ${client.name}?`)) return;
    deleteClient.mutate(client.id, {
      onSuccess: () => toast.success('Cliente eliminado con éxito', toastStyle),
      onError: (error) => {
        const msg = isAxiosError(error) && error.response?.status === 409
          ? 'El cliente tiene facturas asociadas y no puede eliminarse.'
          : 'No se pudo eliminar el cliente.';
        toast.error(msg, toastStyle);
      },
    });
  };

  // Filtrado en tiempo real sobre los datos reales de la API
  const filteredClients = clients.filter((client) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch =
      client.name.toLowerCase().includes(term) ||
      (client.rut ?? '').toLowerCase().includes(term) ||
      (client.email ?? '').toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const isSaving = createClient.isPending || updateClient.isPending;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Toaster position="top-right" />

      {/* CABECERA & ACCIÓN RÁPIDA */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Clientes
          </h1>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
            Gestiona el catálogo de clientes de tu empresa para la emisión de facturas electrónicas.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button className="inline-flex items-center justify-center p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-350 transition-all font-semibold text-sm">
            <FileSpreadsheet className="w-5 h-5 mr-2 text-emerald-600" />
            Exportar CSV
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-primary text-primary-foreground font-semibold hover:bg-primary/95 transition-all shadow-lg shadow-primary/20 hover:-translate-y-0.5"
          >
            <Plus className="w-5 h-5" />
            Agregar Cliente
          </button>
        </div>
      </div>

      {/* FILTROS Y BÚSQUEDA */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-center p-4 bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl shadow-sm">
        <div className="relative w-full md:max-w-md">
          <span className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-zinc-400 dark:text-zinc-500">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Buscar por nombre, RUT, o correo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-450 dark:placeholder-zinc-500 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
          <span className="text-xs font-bold text-zinc-400 uppercase mr-2 hidden lg:inline">
            Estado:
          </span>
          <button
            onClick={() => setStatusFilter('all')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'all'
                ? 'bg-zinc-900 border-zinc-900 text-white dark:bg-white dark:border-white dark:text-black shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Todos ({clients.length})
          </button>
          <button
            onClick={() => setStatusFilter('active')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'active'
                ? 'bg-primary border-primary text-primary-foreground shadow-sm shadow-primary/10'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Activos ({clients.filter((c) => c.status === 'active').length})
          </button>
          <button
            onClick={() => setStatusFilter('inactive')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
              statusFilter === 'inactive'
                ? 'bg-zinc-650 border-zinc-650 text-white dark:bg-zinc-800 dark:border-zinc-800 dark:text-zinc-100 shadow-sm'
                : 'bg-white border-zinc-200 text-zinc-650 hover:bg-zinc-50 dark:bg-[#0e0e0e] dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900'
            }`}
          >
            Inactivos ({clients.filter((c) => c.status === 'inactive').length})
          </button>
        </div>
      </div>

      {/* ESTADOS: CARGANDO / ERROR / LISTADO / VACÍO */}
      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-24 text-zinc-500 dark:text-zinc-400">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="mt-4 text-sm font-medium">Cargando clientes...</p>
        </div>
      ) : isError ? (
        <div className="bg-white dark:bg-[#0e0e0e] border border-red-200 dark:border-red-900/50 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-950/30 flex items-center justify-center mx-auto mb-4">
            <AlertCircle className="w-8 h-8 text-red-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No se pudieron cargar los clientes</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-2">
            Revisa tu conexión e inténtalo nuevamente.
          </p>
          <button
            onClick={() => refetch()}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm hover:bg-primary/95 transition-all"
          >
            Reintentar
          </button>
        </div>
      ) : filteredClients.length > 0 ? (
        <div className="grid gap-6 md:grid-cols-2">
          {filteredClients.map((client) => (
            <div
              key={client.id}
              className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 flex flex-col justify-between relative group"
            >
              <div className="flex justify-between items-start gap-4">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary font-bold text-lg flex items-center justify-center shadow-inner">
                    {client.name.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-zinc-900 dark:text-white text-base group-hover:text-primary transition-colors">
                      {client.name}
                    </h3>
                    <p className="text-xs text-zinc-400 dark:text-zinc-500 font-semibold mt-0.5">{client.rut}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <span className={`
                    inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider
                    ${client.status === 'active'
                      ? 'bg-emerald-500/10 text-primary dark:bg-emerald-500/5'
                      : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                    }
                  `}>
                    {client.status === 'active' ? 'Activo' : 'Inactivo'}
                  </span>
                </div>
              </div>

              <div className="my-6 space-y-3.5 text-sm text-zinc-600 dark:text-zinc-450 border-t border-zinc-50 dark:border-zinc-900/50 pt-5">
                <div className="flex items-center gap-3">
                  <Mail className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">{client.email}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Phone className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span>{client.phone}</span>
                </div>
                <div className="flex items-center gap-3">
                  <MapPin className="w-4 h-4 text-zinc-400 dark:text-zinc-500 shrink-0" />
                  <span className="truncate">{client.address}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-zinc-50 dark:border-zinc-900/50 pt-4 mt-2">
                <Link
                  href={`/clients/${client.id}`}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  Ver historial de facturas
                </Link>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => openEdit(client)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50 dark:hover:text-white dark:hover:bg-zinc-900/60 transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(client)}
                    className="p-2 rounded-lg text-zinc-500 hover:text-red-600 hover:bg-red-500/5 dark:hover:text-red-400 dark:hover:bg-red-950/20 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-16 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-zinc-50 dark:bg-zinc-900 flex items-center justify-center mx-auto mb-4">
            <Users className="w-8 h-8 text-zinc-400 dark:text-zinc-500" />
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white">No se encontraron clientes</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto mt-2">
            Intenta ajustar tu búsqueda o crea un nuevo cliente en el botón de agregar.
          </p>
        </div>
      )}

      {/* --- MODAL DRAWER DESLIZANTE PARA CREAR / EDITAR CLIENTE --- */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 overflow-hidden">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm transition-opacity animate-in fade-in-50"
            onClick={closeModal}
          />

          <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
            <div className="w-screen max-w-md bg-white dark:bg-[#0e0e0e] border-l border-zinc-100 dark:border-zinc-900 shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
              <div className="flex items-center justify-between h-20 px-6 border-b border-zinc-100 dark:border-zinc-900">
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  {editingClient ? 'Editar Cliente' : 'Agregar Nuevo Cliente'}
                </h3>
                <button
                  onClick={closeModal}
                  className="p-1 rounded-lg text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col justify-between overflow-y-auto">
                <div className="p-6 space-y-5">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Razón Social / Nombre Completo
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. Acme Corporation SpA"
                      {...register('name')}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                        ${errors.name ? 'border-red-500 focus:ring-red-200' : 'border-zinc-200 dark:border-zinc-800'}
                      `}
                    />
                    {errors.name && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.name.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      RUT / Identificador Fiscal
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. 76.543.210-9"
                      {...register('rut')}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                        ${errors.rut ? 'border-red-500 focus:ring-red-200' : 'border-zinc-200 dark:border-zinc-800'}
                      `}
                    />
                    {errors.rut && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.rut.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Correo Electrónico de Facturación
                    </label>
                    <input
                      type="email"
                      placeholder="Ej. contacto@empresa.com"
                      {...register('email')}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                        ${errors.email ? 'border-red-500 focus:ring-red-200' : 'border-zinc-200 dark:border-zinc-800'}
                      `}
                    />
                    {errors.email && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Número de Contacto
                    </label>
                    <input
                      type="text"
                      placeholder="Ej. +56 9 8765 4321"
                      {...register('phone')}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm
                        ${errors.phone ? 'border-red-500 focus:ring-red-200' : 'border-zinc-200 dark:border-zinc-800'}
                      `}
                    />
                    {errors.phone && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Dirección Comercial
                    </label>
                    <textarea
                      placeholder="Ej. Av. Vitacura 2670, Santiago"
                      rows={3}
                      {...register('address')}
                      className={`w-full px-4 py-2.5 rounded-xl border bg-zinc-50/50 hover:bg-zinc-50 focus:bg-white dark:bg-zinc-900/30 dark:hover:bg-zinc-900/50 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white placeholder-zinc-400 outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm resize-none
                        ${errors.address ? 'border-red-500 focus:ring-red-200' : 'border-zinc-200 dark:border-zinc-800'}
                      `}
                    />
                    {errors.address && (
                      <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1 font-semibold">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {errors.address.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-2">
                      Estado Inicial
                    </label>
                    <select
                      {...register('status')}
                      className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 focus:bg-white dark:bg-zinc-900/30 dark:focus:bg-[#0a0a0a] text-zinc-900 dark:text-white outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-sm"
                    >
                      <option value="active">Activo</option>
                      <option value="inactive">Inactivo</option>
                    </select>
                  </div>
                </div>

                <div className="p-6 bg-zinc-50 dark:bg-zinc-900/40 border-t border-zinc-100 dark:border-zinc-900/80 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="px-5 py-2.5 rounded-xl border border-zinc-250 hover:bg-zinc-100 text-zinc-700 dark:border-zinc-800 dark:hover:bg-zinc-900 dark:text-zinc-300 font-semibold text-sm transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className="px-6 py-2.5 rounded-xl bg-primary text-primary-foreground hover:bg-primary/95 font-semibold text-sm shadow-md shadow-primary/10 hover:-translate-y-0.5 transition-all disabled:opacity-60 disabled:cursor-not-allowed inline-flex items-center gap-2"
                  >
                    {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {editingClient ? 'Guardar Cambios' : 'Guardar Cliente'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
