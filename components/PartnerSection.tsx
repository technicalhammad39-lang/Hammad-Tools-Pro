'use client';

import React from 'react';
import Image from 'next/image';
import { ExternalLink, Globe, Zap, Crown } from 'lucide-react';
import { useSettings } from '@/context/SettingsContext';

const PartnerSection = () => {
  const { settings } = useSettings();
  
  const partners = [
    {
      name: 'DailyHayat',
      desc: 'Premier network for digital trends and global news updates.',
      url: 'https://dailyhayat.net',
      logo: '/dailyhayat.webp',
      tag: 'Strategic Partner'
    },
    {
      name: 'Khaksar Agency',
      desc: 'Leading digital solutions and premium service scaling for local markets.',
      url: settings.whatsappUrl,
      logo: '/khaksar-crown', 
      tag: 'Digital Partner'
    }
  ];

  return (
    <section className="pt-4 pb-10 md:pt-8 md:pb-20 relative overflow-hidden bg-brand-bg">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-primary/5 blur-[100px] rounded-full -z-10" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-secondary/5 blur-[100px] rounded-full -z-10" />
      
      <div className="site-container">
        <div className="text-center mb-8 md:mb-16">
          <h2
            data-gsap-reveal="gsap"
            className="text-[32px] min-[390px]:text-[34px] sm:text-5xl md:text-6xl lg:text-7xl font-black uppercase text-brand-text mb-4 md:mb-6 leading-none"
          >
            <span className="block font-serif italic text-white normal-case">Trusted</span>
            <span className="internal-gradient block whitespace-nowrap">Partners Network</span>
          </h2>
          <p className="text-brand-text/40 text-xs md:text-sm font-black uppercase tracking-widest max-w-2xl mx-auto">Verified partners, media allies and growth collaborators powering the Hammad Tools ecosystem.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full xl:max-w-[92rem] mx-auto">
          {partners.map((partner, index) => (
            <div
              key={partner.name}
              data-gsap-reveal="gsap"
              data-gsap-reveal-style="soft-card"
              className="group relative"
              style={{ transitionDelay: `${Math.min(index * 70, 210)}ms` }}
            >
              <a 
                href={partner.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="block h-full p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] border border-white/60 transition-all duration-500 overflow-hidden bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF9E6_55%,#FFFFFF_100%)] group-hover:bg-[linear-gradient(135deg,#FFF7D6_0%,#FFE27A_55%,#FFF7D6_100%)] shadow-[0_20px_50px_rgba(255,214,0,0.18)] group-hover:shadow-[0_28px_70px_rgba(255,214,0,0.25)] flex flex-col"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2" />
                <div className="pointer-events-none absolute right-6 top-1/2 hidden -translate-y-1/2 rotate-[-16deg] md:block opacity-[0.06] transition-opacity duration-500 group-hover:opacity-[0.11]">
                  {partner.name === 'Khaksar Agency' ? (
                    <Crown className="h-40 w-40 text-[#1A1A1A]" strokeWidth={1.1} />
                  ) : (
                    <Globe className="h-40 w-40 text-[#1A1A1A]" strokeWidth={1.1} />
                  )}
                </div>
                <div className="flex items-start justify-between gap-4">
                  <div className="w-[68px] h-[68px] md:w-[88px] md:h-[88px] rounded-2xl bg-white/80 flex items-center justify-center border border-black/10 group-hover:scale-105 transition-transform overflow-hidden relative">
                    {partner.name === 'Khaksar Agency' ? (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-white to-[#FFF3C4]">
                        <Crown className="w-10 h-10 text-[#1A1A1A] drop-shadow-[0_8px_16px_rgba(0,0,0,0.15)]" />
                      </div>
                    ) : (
                      <Image
                        src={partner.logo}
                        alt={partner.name}
                        fill
                        className="object-contain object-center p-2.5"
                      />
                    )}
                  </div>
                  <div className="px-4 py-1.5 rounded-full bg-black/5 border border-black/10 text-[8px] font-black uppercase text-[#1A1A1A] tracking-widest">
                    {partner.tag}
                  </div>
                </div>

                <div className="mt-8 flex-1">
                  <h3 className="text-2xl font-black text-[#1A1A1A] uppercase mb-3 flex items-center gap-3">
                    {partner.name}
                    <ExternalLink className="w-4 h-4 text-[#1A1A1A]/30 group-hover:text-[#1A1A1A] transition-colors" />
                  </h3>
                  <p className="text-[#1A1A1A]/60 text-sm font-medium leading-relaxed">
                    {partner.desc}
                  </p>
                </div>

                <div className="mt-8 pt-6 border-t border-black/10 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[9px] font-black uppercase tracking-widest text-[#1A1A1A]/60">
                    <Globe className="w-4 h-4 text-[#1A1A1A]/40" />
                    Verified Partner
                  </div>
                  <Zap className="w-5 h-5 text-primary opacity-60 group-hover:opacity-100 transition-opacity" />
                </div>
              </a>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default PartnerSection;
