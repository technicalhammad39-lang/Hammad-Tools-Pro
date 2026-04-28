'use client';

import React, { useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';

type SnowParticleConfig = {
  leftPercent: number;
  scale: number;
  driftPx: number;
  duration: number;
  delay: number;
};

const SNOW_PARTICLE_COUNT = 10;

function seededRandom(seed: number) {
  const x = Math.sin(seed * 9999.17) * 10000;
  return x - Math.floor(x);
}

const SNOW_PARTICLES: SnowParticleConfig[] = Array.from(
  { length: SNOW_PARTICLE_COUNT },
  (_, index) => {
    const base = index + 1;
    return {
      leftPercent: seededRandom(base * 3.11) * 100,
      scale: seededRandom(base * 2.73) * 0.3 + 0.2,
      driftPx: (seededRandom(base * 4.29) - 0.5) * 180,
      duration: seededRandom(base * 5.07) * 10 + 10,
      delay: seededRandom(base * 7.13) * 20,
    };
  }
);

const subscribe = () => () => {};

function useHydrated() {
  return useSyncExternalStore(subscribe, () => true, () => false);
}

const AnimatedBackground = () => {
  const pathname = usePathname();
  const isHydrated = useHydrated();
  const showParticles =
    pathname === '/' ||
    pathname.startsWith('/about') ||
    pathname.startsWith('/services') ||
    pathname.startsWith('/blogs') ||
    pathname.startsWith('/giveaway');

  return (
    <div className="fixed inset-0 -z-50 overflow-hidden pointer-events-none bg-[#0A0A0A]">
      <div className="ambient-orb ambient-orb-primary" />
      <div className="ambient-orb ambient-orb-secondary" />

      {isHydrated && showParticles && (
        <div className="absolute inset-0 pointer-events-none">
          {SNOW_PARTICLES.map((particle, i) => (
            <div
              key={`snow-${i}`}
              className="absolute w-1 h-1 rounded-full bg-white/60 blur-[1px] ambient-snow-particle"
              style={{
                left: `${particle.leftPercent}%`,
                transform: `scale(${particle.scale})`,
                animationDelay: `${particle.delay}s`,
                animationDuration: `${particle.duration}s`,
                ['--drift-x' as string]: `${particle.driftPx}px`,
              }}
            />
          ))}
        </div>
      )}

      <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(255,214,0,0.06),transparent_55%),radial-gradient(circle_at_80%_70%,rgba(255,140,42,0.05),transparent_60%)]" />
    </div>
  );
};

export default AnimatedBackground;
