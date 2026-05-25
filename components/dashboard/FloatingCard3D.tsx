'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';
import { useAuthStore } from '@/lib/authStore';

// Dynamic configurations for each user
const PLAN_MAPPING: Record<string, { plan: string; badge: string }> = {
  'elias@misaas.cl': {
    plan: 'SaaS Unlimited',
    badge: 'Multi-tenant / Ilimitado'
  },
  'maria@logistica.cl': {
    plan: 'SaaS Enterprise',
    badge: 'Logística & Ruta Activa'
  },
  'carlos@fintech.cl': {
    plan: 'SaaS FinTech Pro',
    badge: 'Pasarela Transaccional'
  }
};

const DEFAULT_PLAN = {
  plan: 'SaaS Plan Demo',
  badge: 'Consola Habilitada'
};

const ACCENT_COLORS: Record<string, { hex: string; glow: string }> = {
  emerald: { hex: '#10b981', glow: '#059669' },
  blue: { hex: '#3b82f6', glow: '#2563eb' },
  violet: { hex: '#8b5cf6', glow: '#7c3aed' },
  amber: { hex: '#f59e0b', glow: '#d97706' },
  rose: { hex: '#f43f5e', glow: '#e11d48' },
};

// Twilight Star Dust Background
function FloatingParticles({ color }: { color: string }) {
  const pointsRef = useRef<THREE.Points>(null);
  
  const [positions, sizes] = useMemo(() => {
    const count = 100;
    const positions = new Float32Array(count * 3);
    const sizes = new Float32Array(count);
    for (let i = 0; i < count; i++) {
      // Box volume around the card
      positions[i * 3] = (Math.random() - 0.5) * 8;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 5;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 4;
      sizes[i] = Math.random() * 0.08 + 0.02;
    }
    return [positions, sizes];
  }, []);

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.03;
      pointsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.01) * 0.05;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute 
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial 
        color={color} 
        size={0.05} 
        sizeAttenuation={true} 
        transparent={true} 
        opacity={0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

// Highly detailed Premium Credit Card Mesh
interface PremiumCardProps {
  colorHex: string;
}

function PremiumCard({ colorHex }: PremiumCardProps) {
  const groupRef = useRef<THREE.Group>(null);
  const cardRef = useRef<THREE.Mesh>(null);
  
  // Rotation animation over time
  useFrame((state) => {
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.4) * 0.15;
      groupRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.3) * 0.08;
    }
  });

  return (
    <group ref={groupRef}>
      {/* CARD BODY WITH ROUNDED BOX GEOMETRY */}
      <mesh ref={cardRef} castShadow receiveShadow>
        <boxGeometry args={[3.2, 2.0, 0.08]} />
        {/* Glassmorphic material with metallic clearcoat */}
        <meshPhysicalMaterial 
          color={colorHex}
          metalness={0.65} 
          roughness={0.15} 
          transmission={0.45} 
          thickness={0.8}
          clearcoat={1.0}
          clearcoatRoughness={0.05}
          ior={1.5}
        />
      </mesh>

      {/* METALLIC CHIP */}
      <mesh position={[-1.0, 0.35, 0.05]}>
        <boxGeometry args={[0.42, 0.34, 0.015]} />
        <meshStandardMaterial 
          color="#fbbf24" // Amber/Gold metal
          metalness={1.0}
          roughness={0.25}
        />
      </mesh>

      {/* CHIP CONTACT PATTERN LINES */}
      <mesh position={[-1.0, 0.35, 0.06]}>
        <boxGeometry args={[0.3, 0.02, 0.01]} />
        <meshBasicMaterial color="#78350f" />
      </mesh>
      <mesh position={[-1.0, 0.35, 0.06]} rotation={[0, 0, Math.PI / 2]}>
        <boxGeometry args={[0.22, 0.02, 0.01]} />
        <meshBasicMaterial color="#78350f" />
      </mesh>

      {/* CONTACTLESS PAYMENT RINGS */}
      <group position={[-0.5, 0.35, 0.05]}>
        <mesh position={[-0.1, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <torusGeometry args={[0.08, 0.008, 8, 24, Math.PI / 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <mesh position={[-0.03, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <torusGeometry args={[0.13, 0.008, 8, 24, Math.PI / 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
        <mesh position={[0.04, 0, 0]} rotation={[0, 0, -Math.PI / 4]}>
          <torusGeometry args={[0.18, 0.008, 8, 24, Math.PI / 2]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.8} />
        </mesh>
      </group>

      {/* HOLOGRAPHIC GEOMETRIC SECURITY BADGE */}
      <mesh position={[1.1, 0.45, 0.05]}>
        <sphereGeometry args={[0.18, 32, 32]} />
        <meshPhysicalMaterial 
          color="#ffffff"
          emissive={colorHex}
          emissiveIntensity={0.8}
          roughness={0.1}
          metalness={0.95}
        />
      </mesh>
      <mesh position={[1.1, 0.45, 0.052]}>
        <ringGeometry args={[0.22, 0.24, 32]} />
        <meshBasicMaterial color="#ffffff" transparent opacity={0.6} />
      </mesh>

      {/* SLEEK CARD HOLDER DECORATION EMBLEM (MASTERCARD VIBE) */}
      <group position={[1.1, -0.45, 0.05]}>
        <mesh position={[-0.12, 0, 0]}>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color="#ef4444" transparent opacity={0.85} /> {/* Red */}
        </mesh>
        <mesh position={[0.12, 0, 0]}>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color="#f97316" transparent opacity={0.85} /> {/* Orange */}
        </mesh>
        <mesh position={[0, 0, 0.005]}>
          <circleGeometry args={[0.16, 32]} />
          <meshBasicMaterial color="#eab308" transparent opacity={0.6} /> {/* Yellow overlap */}
        </mesh>
      </group>

      {/* REVERSE MAGNETIC STRIPE */}
      <mesh position={[0, 0.4, -0.05]}>
        <boxGeometry args={[3.2, 0.35, 0.01]} />
        <meshBasicMaterial color="#18181b" />
      </mesh>
    </group>
  );
}

export default function FloatingCard3D() {
  const { user, companySettings } = useAuthStore();
  
  const email = user?.email || '';
  const accent = companySettings?.accentColor || 'emerald';
  
  const planInfo = PLAN_MAPPING[email] || DEFAULT_PLAN;
  const colorData = ACCENT_COLORS[accent] || ACCENT_COLORS.emerald;

  return (
    <div className="w-full h-[250px] bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col relative group transition-all duration-350 hover:border-zinc-200 dark:hover:border-zinc-800">
      
      {/* PREMIUM PLAN DETAILS OVERLAY */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <span className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          Plan Activo
        </span>
        <h4 className="text-xl font-black text-zinc-900 dark:text-white mt-0.5 tracking-tight">
          {planInfo.plan}
        </h4>
        <div className="flex items-center gap-1.5 mt-1">
          <span 
            className="w-2 h-2 rounded-full animate-pulse" 
            style={{ backgroundColor: colorData.hex }}
          />
          <p className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
            {planInfo.badge}
          </p>
        </div>
      </div>

      {/* WEBGL CANVAS LIENZO */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas 
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true }}
        >
          {/* Enhanced Professional Lighting */}
          <ambientLight intensity={0.55} />
          
          {/* Key light casting dynamic specular highlights */}
          <directionalLight position={[4, 5, 3]} intensity={2.0} castShadow />
          
          {/* Subtle colored backlight matching active tenant theme */}
          <pointLight position={[2, -2, 2]} intensity={1.5} color={colorData.hex} />
          
          {/* Fill lights */}
          <pointLight position={[-4, -3, -2]} intensity={0.5} />
          
          {/* Floating background star dust */}
          <FloatingParticles color={colorData.hex} />

          {/* Floating credit card group */}
          <Float speed={2.2} rotationIntensity={1.0} floatIntensity={1.0}>
            <PremiumCard colorHex={colorData.hex} />
          </Float>

          {/* Interaction controls */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      {/* FOOTER USER SIGNATURE */}
      <div className="absolute bottom-6 left-6 right-6 z-10 pointer-events-none flex justify-between items-center">
        <span className="text-[9px] text-zinc-400 dark:text-zinc-500 font-medium">
          * Arrastra para girar en 3D interactivo
        </span>
        <span className="text-[10px] font-mono tracking-wider text-zinc-400 dark:text-zinc-500 bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-800/80 px-2 py-0.5 rounded-md">
          {user?.company ? user.company.slice(0, 16) : 'Mi SaaS'}
        </span>
      </div>
    </div>
  );
}
