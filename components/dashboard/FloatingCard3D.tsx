'use client';

import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, Float } from '@react-three/drei';
import * as THREE from 'three';

// Componente interno que maneja la rotación y el render del objeto 3D
function CreditCardMesh() {
  const meshRef = useRef<THREE.Mesh>(null);

  // Hace girar levemente la tarjeta en cada frame para darle dinamismo
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * 0.5) * 0.2;
      meshRef.current.rotation.x = Math.cos(state.clock.getElapsedTime() * 0.5) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} rotation={[0, 0.4, 0.15]}>
      {/* Geometría de una tarjeta de crédito premium (proporciones reales) */}
      <boxGeometry args={[3, 1.8, 0.08]} />
      
      {/* Material metalizado con reflejos y rugosidad estilizada */}
      <meshPhysicalMaterial 
        color="#10b981" // Verde Esmeralda Emerald Premium
        metalness={0.9} 
        roughness={0.15} 
        clearcoat={1.0}
        clearcoatRoughness={0.1}
      />
    </mesh>
  );
}

export default function FloatingCard3D() {
  return (
    <div className="w-full h-[240px] bg-white dark:bg-[#0e0e0e] border border-zinc-100 dark:border-zinc-900 rounded-2xl p-6 shadow-sm overflow-hidden flex flex-col relative group">
      
      {/* INFORMACIÓN DE LA TARJETA */}
      <div className="absolute top-6 left-6 z-10 pointer-events-none">
        <span className="text-xs font-bold text-zinc-400 dark:text-zinc-500 uppercase tracking-wider">
          Plan Activo
        </span>
        <h4 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">SaaS Unlimited</h4>
        <p className="text-xs text-primary font-semibold mt-0.5">Acceso Multi-tenant habilitado</p>
      </div>

      {/* LIENZO DE WEBGL (THREE.JS) */}
      <div className="w-full h-full cursor-grab active:cursor-grabbing">
        <Canvas 
          camera={{ position: [0, 0, 3.8], fov: 45 }}
          gl={{ antialias: true }}
        >
          {/* Iluminación del escenario */}
          <ambientLight intensity={0.4} />
          <directionalLight position={[5, 5, 3]} intensity={1.8} castShadow />
          <pointLight position={[-5, -5, -2]} intensity={0.6} />
          
          {/* Componente flotante interactivo de Drei */}
          <Float speed={2.5} rotationIntensity={1.2} floatIntensity={1.2}>
            <CreditCardMesh />
          </Float>

          {/* Controles de órbita restringidos para interactuar con el mouse */}
          <OrbitControls 
            enableZoom={false} 
            enablePan={false}
            maxPolarAngle={Math.PI / 1.5}
            minPolarAngle={Math.PI / 3}
          />
        </Canvas>
      </div>

      <div className="absolute bottom-6 left-6 z-10 pointer-events-none">
        <span className="text-[10px] text-zinc-400 dark:text-zinc-500">
          * Arrastra con el mouse para rotar en 3D
        </span>
      </div>
    </div>
  );
}
