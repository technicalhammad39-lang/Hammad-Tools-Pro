'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import Hero from '@/components/Hero';
import BackToTopButton from '@/components/BackToTopButton';
import { Globe, Award, Zap, Shield, Headphones, Layers, ChevronDown } from 'lucide-react';

const ServicesSection = dynamic(() => import('@/components/ServicesSection'));
const PartnerSection = dynamic(() => import('@/components/PartnerSection'));
const Testimonials = dynamic(() => import('@/components/Testimonials'));

const BRAND_LOGOS = [
  { name: 'Netflix', color: '#E50914' },
  { name: 'Spotify', color: '#1DB954' },
  { name: 'Canva', color: '#00C4CC' },
  { name: 'ChatGPT', color: '#10a37f' },
  { name: 'YouTube', color: '#FF0000' },
  { name: 'Disney+', color: '#006E99' },
  { name: 'Amazon Prime', color: '#00A8E1' },
  { name: 'Crunchyroll', color: '#F47521' },
];

export default function Home() {
  return (
    <div className="relative bg-brand-bg">
      <BackToTopButton />
      <Hero />
      
      {/* Logo Marquee Section */}
      <section
        data-gsap-reveal="gsap"
        className="py-5 md:py-10 border-y border-white/5 bg-black/40 backdrop-blur-xl relative z-10"
      >
        <div className="home-logo-marquee">
          <div className="home-logo-marquee-track">
            {[...BRAND_LOGOS, ...BRAND_LOGOS, ...BRAND_LOGOS].map((platform, index) => (
              <div key={`${platform.name}-${index}`} className="flex items-center space-x-1.5 md:space-x-3 mx-5 md:mx-14 group shrink-0">
                <div
                  className="w-1.5 h-1.5 md:w-2 md:h-2 rounded-full"
                  style={{ backgroundColor: platform.color }}
                />
                <span className="text-base sm:text-xl md:text-2xl font-black text-brand-text/40 group-hover:text-brand-text transition-colors duration-300 uppercase italic whitespace-nowrap">
                  {platform.name}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ServicesSection />
      
      {/* Why Choose Us Section - Premium Cards */}
      <section data-gsap-reveal="gsap" className="py-12 md:py-32 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-primary/5 -z-10" />
        
        <div className="site-container">
          <div className="text-center mb-10 md:mb-20">
            <h2
              data-gsap-reveal="gsap"
              className="text-4xl md:text-7xl font-black mb-4 md:mb-6 text-brand-text uppercase"
            >
              <span className="font-serif italic text-white normal-case">Why</span> Choose <span className="internal-gradient">Us</span>?
            </h2>
            <p className="text-brand-text/60 text-xs max-w-2xl mx-auto font-black uppercase tracking-widest">Experience the best subscription platform with premium features and elite security.</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                title: "Instant Delivery",
                desc: "Get your credentials within seconds of purchase.",
                icon: <Zap className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FFD600"
              },
              {
                title: "24/7 Support",
                desc: "Available around the clock to assist you.",
                icon: <Headphones className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FF8C2A"
              },
              {
                title: "Secure Access",
                desc: "Encryption to protect your data and transactions.",
                icon: <Shield className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FFA94D"
              },
              {
                title: "Premium Quality",
                desc: "High-quality, stable accounts with full warranty.",
                icon: <Award className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FFD600"
              },
              {
                title: "Elite Dashboard",
                desc: "Manage everything in one high-performance dashboard.",
                icon: <Layers className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FF8C2A"
              },
              {
                title: "Global Reach",
                desc: "Our services work worldwide. Access from anywhere.",
                icon: <Globe className="w-5 h-5 md:w-8 md:h-8" />,
                color: "#FFA94D"
              }
            ].map((feature, index) => {
              const isWhiteCard = index % 2 === 0;
              return (
              <div
                key={feature.title}
                data-gsap-reveal="gsap"
                data-gsap-reveal-style="soft-card"
                className={`rounded-2xl md:rounded-[2rem] p-4 md:p-10 border border-white/40 group relative overflow-hidden transition-all duration-500 perspective-1000 flex flex-row items-center md:items-start md:flex-col gap-4 md:gap-0 shadow-[0_20px_50px_rgba(255,214,0,0.18)] ${
                  isWhiteCard
                    ? 'bg-[linear-gradient(135deg,#FFFFFF_0%,#FFF9E6_55%,#FFFFFF_100%)]'
                    : 'bg-[linear-gradient(135deg,#FFFBEA_0%,#FFD600_48%,#FFF6CC_100%)]'
                }`}
              >
                <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                
                <div
                  className="shrink-0 flex items-center justify-center mb-0 md:mb-6 transition-all"
                  style={{ color: feature.color }}
                >
                  {feature.icon}
                </div>
                <div className="flex flex-col">
                  <h3 className="text-base sm:text-lg md:text-2xl font-black mb-1 md:mb-4 text-[#1A1A1A] uppercase">{feature.title}</h3>
                  <p className="text-[#1A1A1A]/70 leading-relaxed font-medium text-[11px] sm:text-xs md:text-sm">{feature.desc}</p>
                </div>
              </div>
            );
            })}
          </div>
        </div>
      </section>

      <div data-gsap-reveal="gsap">
        <PartnerSection />
      </div>

      <div data-gsap-reveal="gsap">
        <Testimonials />
      </div>

      {/* FAQ Section */}
      <section data-gsap-reveal="gsap" className="pt-8 pb-14 md:pt-16 md:pb-28 relative bg-[#0D0D0D] border-t border-white/5">
        <div className="site-container">
          <div className="max-w-3xl mx-auto">
            <div className="text-center mb-10 md:mb-16">
              <h2 className="text-4xl md:text-7xl font-black mb-3 md:mb-4 text-brand-text uppercase">Got <span className="internal-gradient">Questions</span>?</h2>
              <p className="text-brand-text/40 font-black uppercase tracking-widest text-[10px]">Everything you need to know about Hammad Tools.</p>
            </div>
            <div className="space-y-2.5 md:space-y-3.5">
              {[ 
                { q: "How do I receive my subscription?", a: "After payment proof verification, your credentials are delivered inside your dashboard and linked to your account automatically." },
                { q: "Are these subscriptions legal?", a: "Yes, we provide legitimate access to premium services through official channels and bulk enterprise accounts." },
                { q: "What if my account stops working?", a: "We offer a full warranty on all our services. If any issue arises, open a support request and our team will fix or replace access after review." },
                { q: "Can I cancel my subscription?", a: "Yes, you can cancel your monthly plans at any time from your dashboard settings." },
                { q: "What payment methods do you accept?", a: "Checkout shows all active payment methods configured by admin, including wallet, bank, and transfer options with live account details." }
              ].map((item, i) => (
                <details key={i} className="rounded-2xl md:rounded-3xl border border-white/10 bg-white/[0.03] group overflow-hidden transition-colors duration-200 hover:border-primary/25">
                  <summary className="px-4 py-2.5 md:px-6 md:py-5 cursor-pointer font-black text-[11px] md:text-xs uppercase flex justify-between items-center list-none hover:bg-white/[0.04] md:hover:bg-white/5 transition-colors text-brand-text">
                    <span>{item.q}</span>
                    <span className="flex items-center justify-center transition-transform duration-200 group-open:rotate-180">
                      <ChevronDown className="w-4 h-4 text-brand-text/60 md:text-primary" />
                    </span>
                  </summary>
                  <div className="px-4 pb-3 pt-2.5 md:px-6 md:pb-5 md:pt-4 text-brand-text/55 border-t border-white/10 md:border-white/5 font-medium leading-relaxed text-[11px] md:text-xs">
                    {item.a}
                  </div>
                </details>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

