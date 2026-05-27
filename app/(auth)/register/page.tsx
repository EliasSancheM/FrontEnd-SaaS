'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, User, Building2, ArrowRight, Loader2, Info } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

const registerSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres' }),
  company: z.string().min(3, { message: 'El nombre de la empresa debe tener al menos 3 caracteres' }),
  email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
  password: z.string().min(8, { message: 'La contraseña debe tener al menos 8 caracteres' }),
  password_confirmation: z.string().min(8, { message: 'Confirma tu contraseña' }),
  acceptTerms: z.boolean().refine((val) => val === true, {
    message: 'Debes aceptar los términos y condiciones de uso',
  }),
}).refine((data) => data.password === data.password_confirmation, {
  message: 'Las contraseñas no coinciden',
  path: ['password_confirmation'],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { register: registerUser, isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    initialize();
  }, [initialize]);

  useEffect(() => {
    if (isInitialized && isAuthenticated) {
      router.push('/');
    }
  }, [isInitialized, isAuthenticated, router]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      company: '',
      email: '',
      password: '',
      password_confirmation: '',
      acceptTerms: undefined,
    },
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      const success = await registerUser(data.email, data.name, data.company, data.password);
      if (success) {
        toast.success('¡Registro completado con éxito! Bienvenido al SaaS.', {
          icon: '🎉',
        });
        router.push('/');
      } else {
        toast.error('No se pudo completar el registro');
      }
    } catch (error) {
      toast.error('Ocurrió un error al registrar tu cuenta');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-zinc-950">
      {/* FONDO DINÁMICO CON ORBES FLOTANTES DE LUJO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.7),rgba(9,9,11,1))]" />
      
      {/* Orbe Decorativo 1 - Esmeralda */}
      <div className="absolute top-1/3 right-1/4 w-[450px] h-[450px] bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      {/* Orbe Decorativo 2 - Slate */}
      <div className="absolute bottom-1/3 left-1/4 w-[450px] h-[450px] bg-slate-500/5 rounded-full blur-[140px] animate-pulse pointer-events-none" style={{ animationDuration: '9s' }} />

      {/* CONTENEDOR DE LA TARJETA */}
      <div className="relative z-10 w-full max-w-lg transition-all duration-300">
        
        {/* CABECERA / LOGO */}
        <div className="flex flex-col items-center mb-6">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white font-black text-2xl shadow-xl shadow-emerald-500/25 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
            F
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Factura<span className="text-emerald-500">SaaS</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Únete y automatiza la facturación electrónica de tu negocio
          </p>
        </div>

        {/* TARJETA GLASSMORPHIC */}
        <div className="backdrop-blur-xl bg-zinc-900/40 border border-zinc-800/80 rounded-2xl shadow-2xl p-8 hover:border-zinc-700/50 transition-all duration-300">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Crear cuenta corporativa</h2>
            <p className="text-xs text-zinc-400 mt-1">Configuración rápida de tu tenant en menos de un minuto</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            
            {/* DOS COLUMNAS PARA DATOS INICIALES */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* NOMBRE COMPLETO */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre Completo
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <User className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Elías Sánchez"
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-550 focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.name 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                        : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                    }`}
                    {...register('name')}
                  />
                </div>
                {errors.name && (
                  <p className="text-xs text-red-400 mt-1 font-medium">
                    {errors.name.message}
                  </p>
                )}
              </div>

              {/* NOMBRE DE LA EMPRESA / TENANT */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                  Nombre de la Empresa
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                    <Building2 className="w-4 h-4" />
                  </div>
                  <input
                    type="text"
                    placeholder="Mi Empresa SaaS SpA"
                    className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-550 focus:outline-none focus:ring-4 transition-all duration-200 ${
                      errors.company 
                        ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                        : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                    }`}
                    {...register('company')}
                  />
                </div>
                {errors.company && (
                  <p className="text-xs text-red-400 mt-1 font-medium">
                    {errors.company.message}
                  </p>
                )}
              </div>
            </div>

            {/* CORREO ELECTRÓNICO */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Correo Corporativo
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="elias@misaas.cl"
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-550 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* CONTRASEÑA */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-550 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* CONFIRMAR CONTRASEÑA */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-1.5">
                Confirmar Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="Repite tu contraseña"
                  className={`w-full pl-10 pr-4 py-2.5 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-550 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password_confirmation
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10'
                      : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  {...register('password_confirmation')}
                />
              </div>
              {errors.password_confirmation && (
                <p className="text-xs text-red-400 mt-1 font-medium">
                  {errors.password_confirmation.message}
                </p>
              )}
            </div>

            {/* TÉRMINOS Y CONDICIONES */}
            <div className="pt-2">
              <div className="flex items-start">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  className="h-4 w-4 mt-0.5 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 focus:outline-none"
                  {...register('acceptTerms')}
                />
                <label htmlFor="acceptTerms" className="ml-2.5 text-xs text-zinc-450 leading-relaxed select-none">
                  Acepto los <a href="#" className="text-emerald-450 hover:underline">Términos de Servicio</a> y las políticas de facturación según la normativa vigente del SII.
                </label>
              </div>
              {errors.acceptTerms && (
                <p className="text-xs text-red-400 mt-1 font-medium">
                  {errors.acceptTerms.message}
                </p>
              )}
            </div>

            {/* BOTÓN REGISTRARSE */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 mt-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Creando tenant e inicializando...</span>
                </>
              ) : (
                <>
                  <span>Registrar e ingresar</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* DIVISOR Y RETORNO */}
          <div className="h-px bg-zinc-850 my-6" />
          
          <p className="text-center text-xs text-zinc-450">
            ¿Ya tienes una cuenta corporativa activa?{' '}
            <Link href="/login" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all">
              Inicia sesión aquí
            </Link>
          </p>

        </div>

        {/* NOTA MULTI-TENANT */}
        <div className="flex items-start gap-3 mt-6 p-4 rounded-xl bg-zinc-900/20 border border-zinc-850">
          <Info className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          <p className="text-[11px] text-zinc-500 leading-normal">
            <strong>Arquitectura Multi-tenant aislada:</strong> Al registrarte, se crea automáticamente una base de datos lógica o esquema segregado para tu empresa. Esto asegura máxima privacidad, cumplimiento regulatorio y escalabilidad en tus operaciones de facturación.
          </p>
        </div>

      </div>
    </div>
  );
}
