'use client';

import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useGSAP } from '@gsap/react';

const PUBLIC_ANIMATED_PATH_PREFIXES = [
  '/',
  '/about',
  '/tools',
  '/services',
  '/blogs',
  '/contact',
  '/privacy',
  '/terms',
  '/giveaway',
  '/login',
  '/signup',
  '/forgot-password',
];

let gsapRegistered = false;

function registerGsapPlugins() {
  if (gsapRegistered || typeof window === 'undefined') {
    return;
  }
  gsap.registerPlugin(useGSAP, ScrollTrigger);
  gsapRegistered = true;
}

function shouldAnimatePath(pathname: string) {
  return PUBLIC_ANIMATED_PATH_PREFIXES.some((prefix) => {
    if (prefix === '/') {
      return pathname === '/';
    }
    return pathname === prefix || pathname.startsWith(`${prefix}/`);
  });
}

function isVisibleElement(element: HTMLElement) {
  if (element.hasAttribute('data-gsap-skip')) {
    return false;
  }
  const style = window.getComputedStyle(element);
  if (style.display === 'none' || style.visibility === 'hidden') {
    return false;
  }
  return element.getBoundingClientRect().height > 0;
}

function collectAnimationTargets(main: HTMLElement) {
  const explicit = Array.from(main.querySelectorAll<HTMLElement>('[data-gsap-reveal="gsap"]'));

  const uniqueTargets: HTMLElement[] = [];
  const seen = new Set<HTMLElement>();

  for (const candidate of explicit) {
    if (seen.has(candidate)) {
      continue;
    }

    seen.add(candidate);
    if (isVisibleElement(candidate)) {
      uniqueTargets.push(candidate);
    }
  }

  return uniqueTargets.slice(0, 48);
}

function hasAnimated(target: HTMLElement) {
  return target.dataset.gsapAnimated === 'true';
}

function markAnimated(target: HTMLElement) {
  target.dataset.gsapAnimated = 'true';
}

type RevealConfig = {
  from: gsap.TweenVars;
  to: gsap.TweenVars;
  start: string;
};

function buildRevealConfig(target: HTMLElement, isMobile: boolean, index: number, isExplicit: boolean): RevealConfig {
  const style = target.getAttribute('data-gsap-reveal-style');
  const start = target.getAttribute('data-gsap-start') || (isMobile ? 'top 94%' : 'top 88%');
  const baseDelay = Math.min(index * 0.022, 0.18);

  if (style === 'soft-card') {
    return {
      from: { autoAlpha: 0, y: isMobile ? 16 : 24, scale: 0.985 },
      to: {
        autoAlpha: 1,
        y: 0,
        scale: 1,
        duration: isMobile ? 0.5 : 0.62,
        ease: 'power3.out',
        delay: baseDelay,
      },
      start,
    };
  }

  return {
    from: { autoAlpha: 0, y: isExplicit ? (isMobile ? 14 : 28) : (isMobile ? 10 : 18) },
    to: {
      autoAlpha: 1,
      y: 0,
      duration: isExplicit ? (isMobile ? 0.5 : 0.65) : (isMobile ? 0.42 : 0.52),
      ease: 'power2.out',
      delay: baseDelay,
    },
    start,
  };
}

export default function GsapSectionAnimator() {
  const pathname = usePathname();

  useGSAP(
    () => {
      if (!pathname || !shouldAnimatePath(pathname)) {
        return;
      }
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return;
      }

      registerGsapPlugins();

      const main = document.querySelector('main');
      if (!(main instanceof HTMLElement)) {
        return;
      }

      const targets = collectAnimationTargets(main);
      if (!targets.length) {
        return;
      }

      const animateBatch = () => {
        const nextTargets = collectAnimationTargets(main).filter((target) => !hasAnimated(target));
        if (!nextTargets.length) {
          return;
        }

        gsap.set(nextTargets, { willChange: 'transform, opacity' });

        const isMobile = window.matchMedia('(max-width: 767px)').matches;

        nextTargets.forEach((target, index) => {
          markAnimated(target);
          const immediate = target.getAttribute('data-gsap-immediate') === 'true';
          const isExplicit = target.hasAttribute('data-gsap-reveal');
          const config = buildRevealConfig(target, isMobile, index, isExplicit);
          gsap.fromTo(
            target,
            config.from,
            {
              ...config.to,
              clearProps: 'willChange',
              ...(immediate
                ? {}
                : {
                    scrollTrigger: {
                      trigger: target,
                      start: config.start,
                      once: true,
                      fastScrollEnd: true,
                    },
                  }),
            }
          );
        });
      };

      animateBatch();

      const rerunOne = window.setTimeout(animateBatch, 260);
      const rerunTwo = window.setTimeout(animateBatch, 900);

      ScrollTrigger.refresh();

      return () => {
        window.clearTimeout(rerunOne);
        window.clearTimeout(rerunTwo);
      };
    },
    { dependencies: [pathname], revertOnUpdate: true }
  );

  return null;
}
