'use client';

import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { Float, Stars } from '@react-three/drei';
import * as THREE from 'three';

// Dynamic holographic torus knot that shifts colors
function CryptoNode() {
  const meshRef = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = state.clock.getElapsedTime() * 0.2;
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} castShadow>
      <torusKnotGeometry args={[0.9, 0.28, 120, 16, 3, 4]} />
      <meshPhysicalMaterial
        color="#10b981"
        metalness={0.9}
        roughness={0.1}
        transmission={0.4}
        thickness={1.5}
        clearcoat={1.0}
        clearcoatRoughness={0.1}
        ior={1.6}
      />
    </mesh>
  );
}

// Glowing rings representing orbit lines
function OrbitRing({ radius, speed, rotationX, rotationY, color }: { radius: number; speed: number; rotationX: number; rotationY: number; color: string }) {
  const ref = useRef<THREE.Mesh>(null);
  
  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.z = state.clock.getElapsedTime() * speed;
    }
  });

  return (
    <mesh ref={ref} rotation={[rotationX, rotationY, 0]}>
      <ringGeometry args={[radius, radius + 0.02, 64]} />
      <meshBasicMaterial color={color} side={THREE.DoubleSide} transparent opacity={0.3} />
    </mesh>
  );
}

// A system that tracks mouse move and moves the camera slightly for a parallax effect
function Rig() {
  const { camera, mouse } = useThree();
  const vec = new THREE.Vector3();

  return useFrame(() => {
    // Lerp camera position towards the mouse coords for ultra-smooth parallax
    camera.position.lerp(vec.set(mouse.x * 1.5, mouse.y * 1.5, 4.5), 0.05);
    camera.lookAt(0, 0, 0);
  });
}

export default function Login3DShowcase() {
  return (
    <div className="w-full h-full relative overflow-hidden bg-zinc-950 flex flex-col justify-center items-center">
      {/* Abstract Tech Grid Background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#18181b_1px,transparent_1px),linear-gradient(to_bottom,#18181b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />
      
      {/* 3D WebGL Canvas */}
      <div className="w-full h-full absolute inset-0">
        <Canvas camera={{ position: [0, 0, 4.5], fov: 50 }} gl={{ antialias: true }}>
          <ambientLight intensity={0.4} />
          <directionalLight position={[10, 10, 5]} intensity={2.0} />
          <pointLight position={[-10, -10, -5]} intensity={0.5} />
          
          {/* Subtle Cyber colored point lights */}
          <pointLight position={[3, 3, 2]} intensity={2.0} color="#10b981" /> {/* Emerald */}
          <pointLight position={[-3, -3, 2]} intensity={1.5} color="#3b82f6" /> {/* Blue */}
          
          {/* Floating animated central mesh */}
          <Float speed={1.5} rotationIntensity={0.6} floatIntensity={0.6}>
            <CryptoNode />
          </Float>

          {/* Interactive orbit rings */}
          <OrbitRing radius={1.6} speed={0.2} rotationX={Math.PI / 3} rotationY={Math.PI / 4} color="#10b981" />
          <OrbitRing radius={2.0} speed={-0.15} rotationX={-Math.PI / 4} rotationY={Math.PI / 3} color="#3b82f6" />
          <OrbitRing radius={2.3} speed={0.1} rotationX={Math.PI / 2.5} rotationY={-Math.PI / 6} color="#8b5cf6" />
          
          {/* Drei Stars background field */}
          <Stars radius={100} depth={50} count={300} factor={4} saturation={0.5} fade speed={1.5} />

          {/* Parallax Rig */}
          <Rig />
        </Canvas>
      </div>

      {/* Floating Marketing/Tech Value Propositions Overlay */}
      <div className="absolute bottom-16 left-12 right-12 z-10 pointer-events-none space-y-4">
        <div className="backdrop-blur-md bg-zinc-900/40 border border-zinc-800/80 p-6 rounded-2xl max-w-md animate-fade-in duration-1000 shadow-2xl">
          <span className="text-[10px] font-bold tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full uppercase border border-emerald-500/20">
            SaaS Core v3.0
          </span>
          <h3 className="text-xl font-black text-white mt-3.5 tracking-tight">
            Plataforma Avanzada de Facturación
          </h3>
          <p className="text-xs text-zinc-400 mt-2 leading-relaxed">
            Gestión inteligente de folios del SII, pasarelas de pago integradas y control multi-inquilino en tiempo real con cifrado AES-256 local.
          </p>
          <div className="flex gap-4 mt-4 pt-4 border-t border-zinc-800/60 text-[10px] text-zinc-400 font-mono">
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              Sincronizado SII
            </span>
            <span className="flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
              100% Offline-first
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
