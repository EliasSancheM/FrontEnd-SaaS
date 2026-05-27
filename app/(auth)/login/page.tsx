'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Mail, Lock, ArrowRight, Loader2, Key, CheckCircle, Building2 } from 'lucide-react';
import { useAuthStore, DEMO_USERS } from '@/lib/authStore';
import toast from 'react-hot-toast';
import Login3DShowcase from '@/components/auth/Login3DShowcase';
import gsap from 'gsap';
import { useGSAP } from '@gsap/react';

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
  const containerRef = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    if (containerRef.current) {
      gsap.fromTo('.gsap-login-item', 
        { y: 30, opacity: 0 }, 
        { y: 0, opacity: 1, duration: 0.8, stagger: 0.1, ease: 'power3.out', delay: 0.2 }
      );
    }
  }, { scope: containerRef });

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
      const success = await login(data.email, data.password);
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

  // Función para login con usuario demo seleccionado
  const handleDemoLogin = async (demoUser: typeof DEMO_USERS[0]) => {
    setIsLoading(true);
    setValue('email', demoUser.email);
    setValue('password', demoUser.password);
    
    try {
      toast.loading(`Ingresando como ${demoUser.name}...`, { id: 'demo-auth', duration: 800 });
      const success = await login(demoUser.email, demoUser.password);
      if (success) {
        setTimeout(() => {
          toast.success(`¡Bienvenido, ${demoUser.name.split(' ')[0]}!`, { id: 'demo-auth' });
          router.push('/');
        }, 800);
      }
    } catch (error) {
      toast.error('Error en el acceso demo', { id: 'demo-auth' });
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full bg-background text-foreground overflow-hidden grid lg:grid-cols-[1fr_520px] xl:grid-cols-[1fr_580px]">
      
      {/* SECCIÓN IZQUIERDA: WEBGL 3D SHOWCASE (SOLO EN DESKTOP) */}
      <div className="hidden lg:block relative border-r border-border">
        <Login3DShowcase />
      </div>

      {/* SECCIÓN DERECHA: FORMULARIO DE ACCESO (MÓVIL Y DESKTOP) */}
      <div className="relative flex items-center justify-center p-6 sm:p-10 lg:p-12 xl:p-16 overflow-y-auto max-h-screen min-h-screen">
        
        {/* FONDO DINÁMICO MÓVIL (SOLO PARA PANTALLAS PEQUEÑAS) */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(16,185,129,0.06),transparent_50%),radial-gradient(ellipse_at_bottom_left,rgba(30,41,59,0.2),transparent)] lg:hidden pointer-events-none" />
        
        {/* CONTENEDOR DEL FORMULARIO CON REF PARA GSAP */}
        <div ref={containerRef} className="relative z-10 w-full max-w-md transition-all duration-300 my-auto">
        
        {/* CABECERA / LOGO */}
        <div className="flex flex-col items-center mb-8 gsap-login-item opacity-0">
          <div className="flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-emerald-400 text-white font-black text-2xl shadow-xl shadow-emerald-500/25 mb-4 animate-bounce" style={{ animationDuration: '3s' }}>
            F
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground">
            Factura<span className="text-primary">SaaS</span>
          </h1>
          <p className="text-sm text-zinc-400 mt-2 text-center">
            Plataforma Inteligente de Facturación Multi-tenant
          </p>
        </div>

        {/* TARJETA GLASSMORPHIC */}
        <div className="gsap-login-item opacity-0 backdrop-blur-xl bg-card/60 border border-border/60 rounded-2xl shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] dark:shadow-[0_0_50px_-12px_rgba(139,92,246,0.15)] p-8 hover:border-primary/30 transition-all duration-500">
          
          <div className="mb-6">
            <h2 className="text-xl font-bold text-card-foreground">Iniciar Sesión</h2>
            <p className="text-xs text-zinc-400 mt-1">Ingresa tus credenciales para acceder a la consola</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}
            <div className="gsap-login-item opacity-0">
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
                  className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.email 
                      ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/10' 
                      : 'border-border focus:border-primary focus:ring-primary/10'
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
            <div className="gsap-login-item opacity-0">
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
                  className={`w-full pl-10 pr-4 py-3 bg-background/50 border rounded-xl text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-4 transition-all duration-200 ${
                    errors.password 
                      ? 'border-destructive/50 focus:border-destructive focus:ring-destructive/10' 
                      : 'border-border focus:border-primary focus:ring-primary/10'
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
            <div className="flex items-center gsap-login-item opacity-0">
              <input
                id="remember-me"
                name="remember-me"
                type="checkbox"
                className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary/20 focus:ring-offset-0 focus:outline-none"
              />
              <label htmlFor="remember-me" className="ml-2 block text-xs text-zinc-400 select-none">
                Mantener mi sesión iniciada
              </label>
            </div>

            {/* BOTÓN INICIAR SESIÓN */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-primary hover:bg-primary/90 text-primary-foreground font-bold rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-[0.98] disabled:opacity-50 disabled:pointer-events-none transition-all duration-300 cursor-pointer hover:-translate-y-0.5 gsap-login-item opacity-0"
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
          <div className="relative my-6 gsap-login-item opacity-0">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-3 text-muted-foreground tracking-wider font-semibold">Elige una cuenta demo</span>
            </div>
          </div>

          {/* SELECTOR DE USUARIOS DEMO */}
          <div className="space-y-2.5 gsap-login-item opacity-0">
            {DEMO_USERS.map((demoUser) => {
              const colorMap: Record<string, string> = {
                emerald: 'bg-emerald-500/10 text-emerald-400 group-hover:bg-emerald-500/20 border-emerald-500/30',
                blue: 'bg-blue-500/10 text-blue-400 group-hover:bg-blue-500/20 border-blue-500/30',
                violet: 'bg-violet-500/10 text-violet-400 group-hover:bg-violet-500/20 border-violet-500/30',
              };
              const bgMap: Record<string, string> = {
                emerald: 'bg-emerald-500',
                blue: 'bg-blue-500',
                violet: 'bg-violet-500',
              };
              return (
                <button
                  key={demoUser.email}
                  type="button"
                  onClick={() => handleDemoLogin(demoUser)}
                  disabled={isLoading}
                  className={`w-full flex items-center gap-3.5 p-3.5 bg-secondary/30 hover:bg-secondary border border-border rounded-xl text-left transition-all duration-300 hover:border-primary/30 group disabled:opacity-50 disabled:pointer-events-none hover:-translate-y-1`}
                >
                  <div className={`flex items-center justify-center w-10 h-10 rounded-xl ${bgMap[demoUser.color] || 'bg-emerald-500'} text-white text-xs font-black shrink-0 shadow-lg`}>
                    {demoUser.initials}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold text-foreground truncate">{demoUser.name}</p>
                    <p className="text-[10px] text-zinc-400 truncate">{demoUser.company}</p>
                    <p className="text-[10px] text-zinc-500 truncate">{demoUser.email}</p>
                  </div>
                  <ArrowRight className={`w-4 h-4 text-zinc-600 group-hover:text-${demoUser.color}-400 transition-colors shrink-0`} />
                </button>
              );
            })}
          </div>
          
          {/* ENLACE REGISTRO */}
          <p className="text-center text-xs text-muted-foreground mt-6 gsap-login-item opacity-0">
            ¿No tienes una cuenta aún?{' '}
            <Link href="/register" className="text-primary hover:text-primary/80 font-bold hover:underline transition-all">
              Créala aquí gratis
            </Link>
          </p>

        </div>
      </div>
    </div>
  </div>
  );
}
