'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { ArrowRight, Layout, Star, Clock, Loader2, Tag } from 'lucide-react';
import { db } from '@/firebase';
import { collection, getDocs, orderBy, query } from 'firebase/firestore';
import Link from 'next/link';
import { useSettings } from '@/context/SettingsContext';
import { resolveImageSource } from '@/lib/image-display';
import { toSlugFromTitle } from '@/lib/seo';
import type { StoredFileMetadata } from '@/lib/types/domain';
import UploadedImage from '@/components/UploadedImage';

interface AgencyService {
  id: string;
  title?: string;
  slug?: string;
  description?: string;
  thumbnail?: string;
  thumbnailMedia?: StoredFileMetadata | null;
  tags?: string[];
}

function getTitle(service: AgencyService) {
  return (service.title || 'Untitled Service').replace(/\s+/g, ' ').trim();
}

function getServiceSlug(service: AgencyService) {
  return toSlugFromTitle((service.slug || service.title || '').toString()) || service.id;
}

export default function AgencyServicesPage() {
  const { settings } = useSettings();
  const [services, setServices] = useState<AgencyService[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let mounted = true;
    async function loadServices() {
      try {
        const snapshot = await getDocs(query(collection(db, 'agency_services'), orderBy('createdAt', 'desc')));
        if (!mounted) {
          return;
        }
        const docs = snapshot.docs
          .map((doc) => ({ id: doc.id, ...(doc.data() as Omit<AgencyService, 'id'>) }));
        setServices(docs);
      } finally {
        if (mounted) {
          setLoading(false);
        }
      }
    }

    void loadServices();
    return () => {
      mounted = false;
    };
  }, []);

  function buildWhatsappUrl(serviceTitle: string) {
    const rawPhone = settings.supportPhone || '';
    const phone = rawPhone.replace(/[^0-9]/g, '');
    const message = `Assalam o Alaikum, I want to request: ${serviceTitle}. Please share details and price.`;
    if (phone) {
      return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
    }
    if (settings.whatsappUrl) {
      const separator = settings.whatsappUrl.includes('?') ? '&' : '?';
      return `${settings.whatsappUrl}${separator}text=${encodeURIComponent(message)}`;
    }
    return '#';
  }

  const filteredServices = useMemo(() => {
    if (!searchQuery.trim()) {
      return services;
    }
    const needle = searchQuery.trim().toLowerCase();
    return services.filter((service) => {
      const haystack = `${service.title || ''} ${service.description || ''} ${(service.tags || []).join(' ')}`.toLowerCase();
      return haystack.includes(needle);
    });
  }, [services, searchQuery]);

  return (
    <main className="min-h-screen page-navbar-spacing pb-16 md:pb-20 bg-brand-bg relative overflow-hidden">
      <div className="site-container relative z-10">
        <div className="flex flex-col items-center text-center mb-6 md:mb-12">
          <h1
            data-gsap-reveal="gsap"
            className="text-4xl md:text-7xl font-black uppercase tracking-tight text-brand-text whitespace-nowrap"
          >
            <span className="font-serif italic text-white normal-case">Premium</span>{' '}
            <span className="internal-gradient">Services</span>
          </h1>

          <p
            data-gsap-reveal="gsap"
            className="text-brand-text/40 text-[11px] md:text-lg font-medium max-w-2xl mx-auto leading-relaxed mt-3 md:mt-4"
          >
            Request premium agency-grade services directly from the website with secure payment proof and realtime approval tracking.
          </p>
        </div>

        <div
          data-gsap-reveal="gsap"
          className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 mb-6 md:mb-10"
        >
          <div className="relative w-full md:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="Search services..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-4 md:px-5 py-3 md:py-4 text-[9px] md:text-[10px] font-black uppercase tracking-widest focus:outline-none focus:border-primary/50"
            />
          </div>
          <div className="hidden md:block text-[9px] font-black uppercase tracking-widest text-brand-text/40">{filteredServices.length} services</div>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-40 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-[10px] font-black uppercase tracking-widest text-brand-text/20">Loading services...</p>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-40 glass rounded-[3rem] border border-white/5">
            <Layout className="w-16 h-16 text-brand-text/10 mx-auto mb-6" />
            <h3 className="text-xl font-black uppercase text-brand-text mb-2">No Active Services</h3>
            <p className="text-brand-text/40 text-[10px] font-black uppercase tracking-widest">Add services from admin panel to show them here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-7">
            {filteredServices.map((service, index) => {
              const title = getTitle(service);
              const serviceSlug = getServiceSlug(service);
              const serviceHref = `/services/${encodeURIComponent(serviceSlug)}`;
              const thumbnailSrc = resolveImageSource(service, {
                mediaPaths: ['thumbnailMedia'],
                stringPaths: ['thumbnail'],
                placeholder: '/services-card.webp',
              });
              return (
                <div
                  key={service.id}
                  data-gsap-reveal="gsap"
                  className="group relative flex flex-col h-full bg-brand-soft/20 backdrop-blur-2xl border border-white/10 rounded-2xl overflow-hidden hover:border-primary/30 transition-all duration-500 hover:shadow-2xl hover:shadow-primary/5 hover:-translate-y-1"
                  style={{ transitionDelay: `${Math.min(index * 25, 220)}ms` }}
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-[#0E0E0E]">
                    <Link href={serviceHref} className="absolute inset-0 block" aria-label={`Open ${title}`}>
                      <UploadedImage
                        src={thumbnailSrc}
                        fallbackSrc="/services-card.webp"
                        alt={title}
                        className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.035]"
                        referrerPolicy="no-referrer"
                      />
                    </Link>
                    <div className="absolute inset-0 bg-gradient-to-t from-brand-bg/88 via-transparent to-transparent opacity-70 pointer-events-none" />
                    <div className="absolute top-4 left-4 right-4 flex justify-between items-start pointer-events-none">
                      <div className="bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/10 flex items-center gap-1.5">
                        <Star className="w-3 h-3 text-primary fill-primary" />
                        <span className="text-[8px] font-black uppercase text-white/80">Premium</span>
                      </div>
                    </div>
                  </div>

                  <div className="p-5 md:p-6 flex flex-col flex-1">
                    <Link href={serviceHref} className="block">
                      <h3 className="text-xl md:text-2xl font-black text-brand-text leading-tight mb-3 group-hover:text-primary transition-colors break-words line-clamp-2 min-h-[2.35em]">
                        {title}
                      </h3>
                    </Link>

                    <p className="text-brand-text/48 text-xs md:text-sm font-medium leading-relaxed mb-5 line-clamp-3 min-h-[4.2em]">
                      {service.description || 'Contact us for this service.'}
                    </p>

                    {Array.isArray(service.tags) && service.tags.length ? (
                      <div className="flex flex-wrap gap-2 mb-6">
                        {service.tags.slice(0, 4).map((tag) => (
                          <span key={tag} className="text-[9px] font-black tracking-widest text-brand-text/45 border border-white/10 px-2 py-1 rounded-md flex items-center gap-1 break-words">
                            <Tag className="w-3 h-3 text-primary" /> {tag}
                          </span>
                        ))}
                      </div>
                    ) : null}

                    <div className="mt-auto flex flex-col gap-4">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <Clock className="w-3 h-3 text-brand-text/20" />
                          <span className="text-[9px] font-black uppercase tracking-widest text-brand-text/20">Custom Scope</span>
                        </div>
                        <Link href={serviceHref} className="text-[10px] font-black uppercase tracking-widest text-primary hover:underline">
                          View Details
                        </Link>
                      </div>

                      <button
                        onClick={() => {
                          const url = buildWhatsappUrl(title);
                          if (url && url !== '#') {
                            window.open(url, '_blank', 'noopener,noreferrer');
                          }
                        }}
                        className="w-full bg-primary text-black py-3.5 rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-3 hover:bg-primary/90 transition-all shadow-xl group/btn border-b-4 border-secondary"
                      >
                        <span>Request Service</span>
                        <ArrowRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
