'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Loader2, Key, CheckCircle } from 'lucide-react';
import { useAuthStore } from '@/lib/authStore';
import toast from 'react-hot-toast';

const loginSchema = z.object({
  email: z.string().email({ message: 'Ingresa un correo electrónico válido' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres' }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const { login, isAuthenticated, isInitialized, initialize } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    setValue,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true);
    try {
      const success = await login(data.email);
      if (success) {
        toast.success('¡Sesión iniciada con éxito! Bienvenido.', {
          icon: '🚀',
        });
        router.push('/');
      } else {
        toast.error('Credenciales inválidas');
      }
    } catch (error) {
      toast.error('Ocurrió un error al iniciar sesión');
    } finally {
      setIsLoading(false);
    }
  };

  // Función para autocompletar e iniciar sesión rápidamente
  const handleQuickAccess = async () => {
    setIsLoading(true);
    setValue('email', 'elias@misaas.cl');
    setValue('password', '123456');
    
    try {
      toast.loading('Inyectando credenciales de prueba...', { id: 'demo-auth', duration: 800 });
      const success = await login('elias@misaas.cl', 'Elías Sánchez', 'Mi Empresa SaaS SpA');
      if (success) {
        setTimeout(() => {
          toast.success('¡Acceso rápido concedido! Redirigiendo...', { id: 'demo-auth' });
          router.push('/');
        }, 800);
      }
    } catch (error) {
      toast.error('Error en el acceso demo rápido', { id: 'demo-auth' });
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex items-center justify-center p-4 overflow-hidden bg-zinc-950">
      {/* FONDO DINÁMICO CON ORBES FLOTANTES DE LUJO */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.12),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.7),rgba(9,9,11,1))]" />
      
      {/* Orbe Decorativo 1 - Esmeralda */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] animate-pulse pointer-events-none" />
      {/* Orbe Decorativo 2 - Slate */}
      <div className="absolute bottom-1/4 right-1/4 w-[500px] h-[500px] bg-slate-500/5 rounded-full blur-[150px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />

      {/* CONTENEDOR DE LA TARJETA */}
      <div className="relative z-10 w-full max-w-md transition-all duration-300">
        
        {/* CABECERA / LOGO */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white font-black text-2xl shadow-xl shadow-emerald-500/25 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
            F
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            Factura<span className="text-emerald-500">SaaS</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Plataforma Inteligente de Facturación Multi-tenant
          </p>
        </div>

        {/* TARJETA GLASSMORPHIC */}
        <div className="backdrop-blur-xl bg-zinc-900/40 border border-zinc-800/80 rounded-2xl shadow-2xl p-8 hover:border-zinc-700/50 transition-all duration-300">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white">Iniciar Sesión</h2>
            <p className="text-xs text-zinc-400 mt-1">Ingresa tus credenciales para acceder a la consola</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400 mb-2">
                Correo Electrónico
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  placeholder="nombre@empresa.com"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.email 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  {...register('email')}
                />
              </div>
              {errors.email && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-zinc-400">
                  Contraseña
                </label>
                <a href="#" className="text-xs text-emerald-400 hover:text-emerald-300 hover:underline transition-all">
                  ¿La olvidaste?
                </a>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-zinc-500">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  placeholder="••••••••"
                  className={`w-full pl-10 pr-4 py-3 bg-zinc-900/60 border rounded-xl text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password 
                      ? 'border-red-500/50 focus:border-red-500 focus:ring-red-500/10' 
                      : 'border-zinc-800 focus:border-emerald-500 focus:ring-emerald-500/10'
                  }`}
                  {...register('password')}
                />
              </div>
              {errors.password && (
                <p className="text-xs text-red-400 mt-1.5 flex items-center gap-1 font-medium">
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* RECORDAR SESIÓN */}
            <div className="flex items-center">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-zinc-800 bg-zinc-900 text-emerald-500 focus:ring-emerald-500/20 focus:ring-offset-0 focus:outline-none"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-400 select-none">
                Mantener mi sesión iniciada
              </label>
            </div>

            {/* BOTÓN INICIAR SESIÓN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold rounded-xl shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/25 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-150 cursor-pointer"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verificando credenciales...</span>
                </>
              ) : (
                <>
                  <span>Ingresar a la consola</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* DIVISOR DE ACCESO RÁPIDO */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-850" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-[#121215] px-3 text-zinc-500 tracking-wider font-semibold">O prueba rápido</span>
            </div>
          </div>

          {/* ACCESO DEMO RÁPIDO */}
          <button
            type="button"
            onClick={handleQuickAccess}
            disabled={isLoading}
            className="w-full flex items-center justify-between p-3.5 bg-zinc-850 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-left transition-all duration-200 hover:border-emerald-500/30 group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 transition-all">
                <Key className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">Acceso Demo Rápido</p>
                <p className="text-[10px] text-zinc-400 mt-0.5">Ingresar al instante sin escribir</p>
              </div>
            </div>
            <CheckCircle className="w-4 h-4 text-zinc-500 group-hover:text-emerald-400 transition-colors" />
          </button>
          
          {/* ENLACE REGISTRO */}
          <p className="text-center text-xs text-zinc-400 mt-6">
            ¿No tienes una cuenta aún?{' '}
            <Link href="/register" className="text-emerald-400 hover:text-emerald-300 font-bold hover:underline transition-all">
              Créala aquí gratis
            </Link>
          </p>

        </div>
      </div>
    </div>
  );
}
