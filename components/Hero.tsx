'use client';

import React from 'react';
import { ArrowRight, Star, MousePointer2, Quote } from 'lucide-react';
import Link from 'next/link';
import UploadedImage from '@/components/UploadedImage';

const HERO_PHRASES = ['PRO COURSES', 'PREMIUM TOOLS', 'DIGITAL ASSETS'];
const LONGEST_HERO_PHRASE = HERO_PHRASES.reduce((longest, phrase) =>
  phrase.length > longest.length ? phrase : longest
);

const Hero = () => {
  const [showDesktopVideo, setShowDesktopVideo] = React.useState(false);
  const [activePhraseIndex, setActivePhraseIndex] = React.useState(0);
  const [typedPhrase, setTypedPhrase] = React.useState('');
  const [isDeletingPhrase, setIsDeletingPhrase] = React.useState(false);
  const reviewAvatars = [
    '/reviews/1-rev.png',
    '/reviews/2-rev.png',
    '/reviews/3-rev3.png',
    '/reviews/4-rev4.png',
  ];

  function handleReviewPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const rect = event.currentTarget.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width - 0.5) * 2;
    const y = ((event.clientY - rect.top) / rect.height - 0.5) * 2;
    event.currentTarget.style.setProperty('--hero-card-a-x', `${x * -4.5}px`);
    event.currentTarget.style.setProperty('--hero-card-a-y', `${y * -3.5}px`);
    event.currentTarget.style.setProperty('--hero-card-b-x', `${x * 3.5}px`);
    event.currentTarget.style.setProperty('--hero-card-b-y', `${y * 4}px`);
    event.currentTarget.style.setProperty('--hero-tilt-x', `${y * -4}deg`);
    event.currentTarget.style.setProperty('--hero-tilt-y', `${x * 4}deg`);
    event.currentTarget.style.setProperty('--hero-tilt-b-x', `${y * 3.2}deg`);
    event.currentTarget.style.setProperty('--hero-tilt-b-y', `${x * -3.2}deg`);
    event.currentTarget.style.setProperty('--hero-cursor-x', `${x * 52}px`);
    event.currentTarget.style.setProperty('--hero-cursor-y', `${y * 36}px`);
  }

  function handleReviewPointerLeave(event: React.PointerEvent<HTMLDivElement>) {
    event.currentTarget.style.setProperty('--hero-card-a-x', '0px');
    event.currentTarget.style.setProperty('--hero-card-a-y', '0px');
    event.currentTarget.style.setProperty('--hero-card-b-x', '0px');
    event.currentTarget.style.setProperty('--hero-card-b-y', '0px');
    event.currentTarget.style.setProperty('--hero-tilt-x', '0deg');
    event.currentTarget.style.setProperty('--hero-tilt-y', '0deg');
    event.currentTarget.style.setProperty('--hero-tilt-b-x', '0deg');
    event.currentTarget.style.setProperty('--hero-tilt-b-y', '0deg');
    event.currentTarget.style.setProperty('--hero-cursor-x', '0px');
    event.currentTarget.style.setProperty('--hero-cursor-y', '0px');
  }

  React.useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 1024px)');
    const sync = () => setShowDesktopVideo(mediaQuery.matches);
    sync();

    mediaQuery.addEventListener('change', sync);
    return () => {
      mediaQuery.removeEventListener('change', sync);
    };
  }, []);

  React.useEffect(() => {
    const currentPhrase = HERO_PHRASES[activePhraseIndex] || '';
    const phraseComplete = !isDeletingPhrase && typedPhrase === currentPhrase;
    const phraseCleared = isDeletingPhrase && typedPhrase.length === 0;

    const delay = phraseComplete ? 1850 : isDeletingPhrase ? 46 : 90;

    const timer = window.setTimeout(() => {
      if (phraseComplete) {
        setIsDeletingPhrase(true);
        return;
      }

      if (phraseCleared) {
        setIsDeletingPhrase(false);
        setActivePhraseIndex((prev) => (prev + 1) % HERO_PHRASES.length);
        return;
      }

      const nextLength = isDeletingPhrase ? typedPhrase.length - 1 : typedPhrase.length + 1;
      setTypedPhrase(currentPhrase.slice(0, nextLength));
    }, delay);

    return () => window.clearTimeout(timer);
  }, [activePhraseIndex, isDeletingPhrase, typedPhrase]);

  return (
    <section className="home-hero-section relative flex w-full flex-col items-center justify-start overflow-hidden pt-[calc(var(--promo-ticker-height)+var(--navbar-height)+0.75rem)] pb-8 sm:pt-[calc(var(--promo-ticker-height)+var(--navbar-height)+1rem)] sm:pb-10 md:min-h-[72svh] md:justify-center md:pb-10 lg:min-h-[88dvh] lg:pt-[calc(var(--promo-ticker-height)+var(--navbar-height)+1rem)] lg:pb-2">
      {/* Background Layer */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {showDesktopVideo ? (
          <video
            autoPlay
            loop
            muted
            playsInline
            preload="none"
            className="absolute inset-0 w-full h-full object-cover opacity-20"
          >
            <source src="/web-background.mp4" type="video/mp4" />
          </video>
        ) : null}
        <div className="absolute inset-0 bg-black/60" />
        <div className="absolute inset-0 cyber-grid opacity-[0.1]" />
        
        {/* Decorative Gradients */}
        <div className="absolute top-[10%] left-[10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[10%] right-[10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-[120px]" />
      </div>

      <div className="site-container-wide w-full relative z-10">
        <div className="home-hero-grid grid grid-cols-1 lg:grid-cols-[minmax(0,1.14fr)_minmax(0,0.86fr)] gap-6 sm:gap-7 md:gap-8 lg:gap-9 xl:gap-11 items-center">
          <div
            data-gsap-reveal="gsap"
            data-gsap-immediate="true"
            data-gsap-skip="true"
            className="home-hero-copy relative z-20 md:w-full md:max-w-4xl md:mx-auto md:flex md:flex-col md:items-center md:text-center lg:items-start lg:text-left lg:mx-0 lg:max-w-none"
          >
            <h1 className="mb-3 text-brand-text text-left md:mb-5 md:text-center lg:text-left">
              <span className="block text-[clamp(1.95rem,8.3vw,2.85rem)] md:text-[clamp(2.6rem,5.4vw,4.65rem)] font-serif font-bold md:font-extrabold italic text-white leading-[1.03]">
                Unlock The
              </span>
              <span className="relative mt-1 sm:mt-2 block min-h-[1.16em] overflow-visible">
                <span
                  aria-hidden="true"
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="home-hero-dynamic-ghost invisible block w-max md:mx-auto lg:mx-0 text-[clamp(3.25rem,14.2vw,5.65rem)] sm:text-[clamp(3.55rem,12vw,6rem)] md:text-[clamp(4rem,8.4vw,7.1rem)] lg:text-[clamp(4.4rem,6.9vw,7rem)] font-black uppercase leading-[0.98] tracking-[0.006em] whitespace-nowrap"
                >
                  {LONGEST_HERO_PHRASE}
                </span>
                <span
                  style={{ fontFamily: 'var(--font-display)' }}
                  className="home-hero-dynamic-text absolute inset-0 inline-flex w-max items-end md:mx-auto lg:mx-0 text-[clamp(3.25rem,14.2vw,5.65rem)] sm:text-[clamp(3.55rem,12vw,6rem)] md:text-[clamp(4rem,8.4vw,7.1rem)] lg:text-[clamp(4.4rem,6.9vw,7rem)] font-black bg-gradient-to-b from-[#FFEA00] to-[#FF9500] bg-clip-text text-transparent uppercase leading-[0.98] tracking-[0.006em] whitespace-nowrap"
                >
                  {typedPhrase || '\u00A0'}
                  <span aria-hidden="true" className="typing-caret ml-1 inline-block h-[0.86em] w-[0.07em] rounded-full bg-[#FFEA00]" />
                </span>
              </span>
            </h1>

            <p
              data-gsap-reveal="gsap"
              data-gsap-immediate="true"
              data-gsap-skip="true"
              className="mb-2 text-left md:mb-3 md:text-center lg:text-left"
            >
              <span className="block md:hidden text-white text-[clamp(1.52rem,6.7vw,2.2rem)] sm:text-[clamp(1.7rem,6vw,2.35rem)] font-black leading-[1.08]">
                At the cheap price
              </span>
              <span className="hidden md:block text-white text-[10px] sm:text-[11px] md:text-xs font-black uppercase tracking-[0.18em]">
                One Trusted Hub For Premium Digital Access
              </span>
            </p>
            
            <p
              data-gsap-reveal="gsap"
              data-gsap-immediate="true"
              data-gsap-skip="true"
              className="home-hero-description relative z-20 mx-0 mt-1.5 mb-4 max-w-md text-left text-[12px] font-medium leading-[1.5] text-gray-300/90 sm:max-w-lg sm:text-[13px] md:mx-auto md:mt-3 md:mb-5 md:max-w-3xl md:text-center md:text-xl md:leading-relaxed md:text-brand-text/62 lg:mx-0 lg:text-left"
            >
              Access Netflix, ChatGPT Plus, Canva Pro, and 50+ other premium content access at unbeatable prices. Fast, secure, and reliable.
            </p>

            <div className="w-full md:w-auto">
              <div className="home-hero-actions grid w-full grid-cols-2 gap-2.5 md:gap-3 lg:flex lg:w-auto lg:flex-nowrap lg:items-center lg:justify-start">
                <Link href="/tools" className="col-span-1 w-full lg:w-auto">
                  <button
                    className="w-full h-12 md:h-[52px] lg:h-14 lg:min-w-[182px] xl:min-w-[196px] bg-primary text-brand-bg px-3 md:px-6 rounded-xl font-black flex items-center justify-center gap-2 transition-all border-b-4 border-[#FF8C2A] shadow-xl shadow-primary/10 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.1em]">Explore Tools</span>
                    <ArrowRight className="w-4 h-4 -rotate-45" />
                  </button>
                </Link>

                <Link href="/services" className="col-span-1 w-full lg:w-auto">
                  <button
                    className="w-full h-12 md:h-[52px] lg:h-14 lg:min-w-[182px] xl:min-w-[196px] bg-[linear-gradient(135deg,#2F2F2F_0%,#242424_58%,#1D1D1D_100%)] text-brand-text px-3 md:px-6 rounded-xl font-black flex items-center justify-center gap-2 transition-all border border-[#656565]/45 shadow-xl shadow-black/35 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.1em]">Services</span>
                    <ArrowRight className="w-4 h-4 -rotate-45 text-brand-text/80" />
                  </button>
                </Link>

                <Link href="/about" className="col-span-2 block w-full lg:col-span-1 lg:w-auto">
                  <button
                    className="w-full h-12 md:h-[52px] lg:h-14 lg:min-w-[196px] xl:min-w-[210px] glass hover:bg-white/10 text-white px-4 md:px-8 rounded-xl font-black flex items-center justify-center gap-2 transition-all border border-white/20 hover:scale-[1.02] active:scale-[0.98]"
                  >
                    <span className="text-[10px] md:text-xs uppercase tracking-[0.1em]">How It Works</span>
                    <ArrowRight className="w-4 h-4 -rotate-45 text-white/85" />
                  </button>
                </Link>
              </div>
            </div>

            <div className="home-hero-trust mt-5 flex flex-row items-center justify-start gap-4 text-left sm:gap-6 md:mt-6 md:justify-center md:text-center lg:justify-start lg:text-left">
              <div className="flex -space-x-3 md:-space-x-4">
                {reviewAvatars.map((avatarSrc, index) => (
                  <div key={avatarSrc} className="w-10 h-10 md:w-12 md:h-12 lg:h-14 lg:w-14 rounded-full border-2 border-brand-bg overflow-hidden shadow-xl relative first:ml-0">
                    <UploadedImage
                      src={avatarSrc}
                      fallbackSrc="/services-card.webp"
                      alt={`Trusted user review avatar ${index + 1}`}
                      className="absolute inset-0 w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <div className="flex flex-col justify-center gap-1">
                <div className="flex items-center text-secondary gap-0.5 md:justify-center lg:justify-start">
                  {[1, 2, 3, 4, 5].map((i) => <Star key={i} className="w-4 h-4 md:h-5 md:w-5 lg:w-6 lg:h-6 fill-current" />)}
                </div>
                <p className="text-[10px] md:text-sm lg:text-base font-medium text-gray-300 whitespace-nowrap uppercase tracking-wider">Trusted by 10k+ users</p>
              </div>
            </div>
          </div>

          {/* Floating UI Elements - Overlapping Tilted Review Cards */}
          <div
            data-gsap-reveal="gsap"
            data-gsap-immediate="true"
            data-gsap-skip="true"
            onPointerMove={handleReviewPointerMove}
            onPointerLeave={handleReviewPointerLeave}
            className="home-hero-review-stage hero-review-stage relative z-10 hidden lg:flex justify-center items-center h-[530px]"
          >
            {/* Review Card 1 (Darker Yellow) */}
            <div
              className="absolute top-20 right-0 z-20 bg-gradient-to-br from-[#5C5000] to-[#121212] p-8 rounded-[2rem] w-80 border border-primary/20 shadow-2xl hero-floating-card-a"
            >
              <Quote className="text-primary w-10 h-10 mb-4 opacity-30" />
              <p className="text-lg font-black mb-6 leading-tight text-brand-text">
                &quot;Hammad Tools is a lifesaver! Got my Netflix and Canva Pro at 80% discount. Instant delivery!&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden relative">
                  <UploadedImage
                    src="/rev-1hm.webp"
                    fallbackSrc="/reviews/1-rev.png"
                    alt="Ali Rajput profile photo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-brand-text">Ali Rajput</p>
                  <p className="text-xs text-brand-text/40">Verified Customer</p>
                </div>
              </div>
            </div>
 
            {/* Review Card 2 */}
            <div
              className="absolute bottom-20 left-0 z-10 bg-gradient-to-bl from-[#FF8C2A]/20 to-[#1A1A1A] p-8 rounded-[2rem] w-80 border border-secondary/10 shadow-2xl hero-floating-card-b"
            >
              <Quote className="text-secondary w-10 h-10 mb-4 opacity-30" />
              <p className="text-lg font-black mb-6 leading-tight text-brand-text">
                &quot;The support team is amazing. Had an issue with my ChatGPT Plus and they fixed it in 5 mins.&quot;
              </p>
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/10 border border-white/20 overflow-hidden relative">
                  <UploadedImage
                    src="/rev-2hm.webp"
                    fallbackSrc="/reviews/2-rev.png"
                    alt="Hina Iqbal profile photo"
                    className="absolute inset-0 w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-sm font-black text-brand-text">Hina Iqbal</p>
                  <p className="text-xs text-brand-text/40">Pro Member</p>
                </div>
              </div>
            </div>

            {/* Sleek Cursor Icon */}
            <div className="absolute z-30 pointer-events-none hero-floating-cursor">
              <MousePointer2 className="w-12 h-12 text-primary fill-primary/20" />
            </div>

            {/* Decorative Sharp Glow */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 border border-primary/10 rounded-full -z-10" />
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
