'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  ArrowRight,
  BadgeCheck,
  Bot,
  CheckCircle2,
  ChevronDown,
  Code2,
  Layers3,
  LayoutDashboard,
  Loader2,
  MessageCircle,
  Palette,
  PenTool,
  Rocket,
  Send,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Store,
} from 'lucide-react';
import {
  DEFAULT_AGENCY_SERVICES,
  type AgencyServiceProfile,
} from '@/lib/agency-service-defaults';
import UploadedImage from '@/components/UploadedImage';

type InquiryState = {
  name: string;
  email: string;
  phone: string;
  company: string;
  selectedService: string;
  budget: string;
  message: string;
};

const initialInquiry: InquiryState = {
  name: '',
  email: '',
  phone: '',
  company: '',
  selectedService: '',
  budget: '',
  message: '',
};

const processSteps = [
  ['Discovery', 'We understand your business, goals, audience and required features.'],
  ['Strategy', 'We plan the structure, user flow, features and best technology.'],
  ['Design', 'We create clean UI/UX or brand visuals that match your business identity.'],
  ['Development', 'We build the website, app, store, software, SaaS or AI solution.'],
  ['Testing', 'We test speed, mobile responsiveness, forms, checkout, features and user experience.'],
  ['Launch & Support', 'We launch the project and support future updates, improvements and growth.'],
];

const whyChooseUs = [
  'Complete digital team in one place',
  'Business-focused design and development',
  'Modern UI/UX and premium visual quality',
  'Scalable backend and clean code',
  'SEO-friendly and speed-optimized structure',
  'Long-term support and improvements',
];

const faqs = [
  {
    q: 'What services does your digital agency provide?',
    a: 'We provide web development, app development, Shopify and WooCommerce stores, AI development, software development, SaaS development, graphic design and logo design services.',
  },
  {
    q: 'Can you build a complete website and brand identity together?',
    a: 'Yes, we can design your logo, brand visuals and complete website so your business has a consistent and professional online presence.',
  },
  {
    q: 'Do you build custom software or SaaS platforms?',
    a: 'Yes, we build custom business software and SaaS platforms with dashboards, user accounts, admin panels, payments and scalable features.',
  },
  {
    q: 'Can you develop AI tools for my business?',
    a: 'Yes, we can build AI chatbots, AI website widgets, automation tools and custom AI workflows based on your business needs.',
  },
  {
    q: 'How can I start a project with you?',
    a: 'You can submit the project inquiry form, select your required service and share your idea. Our team will review it and contact you with the next steps.',
  },
];

function renderServiceIcon(icon: string | undefined, className = 'h-6 w-6') {
  const key = (icon || '').toLowerCase();
  if (key.includes('smartphone') || key.includes('app')) return <Smartphone className={className} />;
  if (key.includes('shopping') || key.includes('shopify')) return <ShoppingBag className={className} />;
  if (key.includes('store') || key.includes('woo')) return <Store className={className} />;
  if (key.includes('bot') || key.includes('ai')) return <Bot className={className} />;
  if (key.includes('dashboard') || key.includes('software')) return <LayoutDashboard className={className} />;
  if (key.includes('layers') || key.includes('saas')) return <Layers3 className={className} />;
  if (key.includes('palette') || key.includes('graphic')) return <Palette className={className} />;
  if (key.includes('badge') || key.includes('logo')) return <PenTool className={className} />;
  if (key.includes('code') || key.includes('web')) return <Code2 className={className} />;
  return <Sparkles className={className} />;
}

function normalizeService(input: AgencyServiceProfile): AgencyServiceProfile {
  return {
    ...input,
    bulletPoints: Array.isArray(input.bulletPoints) && input.bulletPoints.length ? input.bulletPoints : input.features || [],
    shortDescription: input.shortDescription || input.description,
    fullDescription: input.fullDescription || input.description,
  };
}

export default function AgencyServicesPage() {
  const searchParams = useSearchParams();
  const inquiryRef = useRef<HTMLDivElement | null>(null);
  const [services, setServices] = useState<AgencyServiceProfile[]>(DEFAULT_AGENCY_SERVICES.map(normalizeService));
  const [servicesLoading, setServicesLoading] = useState(true);
  const [servicesError, setServicesError] = useState('');
  const [inquiry, setInquiry] = useState<InquiryState>(initialInquiry);
  const [submitting, setSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    let mounted = true;
    async function loadServices() {
      setServicesLoading(true);
      setServicesError('');
      try {
        const response = await fetch('/api/digital-services', { cache: 'no-store' });
        const payload = (await response.json().catch(() => ({}))) as {
          success?: boolean;
          services?: AgencyServiceProfile[];
          error?: string;
        };
        if (!response.ok || !payload.success || !Array.isArray(payload.services)) {
          throw new Error(payload.error || 'Failed to load services.');
        }
        if (mounted) {
          setServices(payload.services.map(normalizeService));
        }
      } catch (error) {
        if (mounted) {
          setServices(DEFAULT_AGENCY_SERVICES.map(normalizeService));
          setServicesError('Live services could not load, so the page is showing the default Digital Solutions catalog.');
        }
      } finally {
        if (mounted) setServicesLoading(false);
      }
    }
    void loadServices();
    return () => {
      mounted = false;
    };
  }, []);

  useEffect(() => {
    const selected = searchParams.get('service') || searchParams.get('request') || '';
    if (selected) {
      setInquiry((prev) => ({ ...prev, selectedService: selected }));
      window.requestAnimationFrame(() => inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }));
    }
  }, [searchParams]);

  const activeServices = useMemo(
    () => services.filter((service) => service.status !== 'inactive' && service.active !== false).sort((a, b) => Number(a.displayOrder || 999) - Number(b.displayOrder || 999)),
    [services]
  );

  const selectService = (serviceTitle = '') => {
    setInquiry((prev) => ({ ...prev, selectedService: serviceTitle || prev.selectedService }));
    inquiryRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const submitInquiry = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);
    setSubmitMessage(null);
    try {
      const response = await fetch('/api/project-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...inquiry, pagePath: '/services' }),
      });
      const payload = (await response.json().catch(() => ({}))) as { success?: boolean; message?: string; error?: string };
      if (!response.ok || !payload.success) {
        throw new Error(payload.error || `Submission failed (HTTP ${response.status}).`);
      }
      setSubmitMessage({ type: 'success', text: payload.message || 'Thanks! Your project inquiry has been received. Our team will contact you soon.' });
      setInquiry(initialInquiry);
    } catch (error) {
      setSubmitMessage({ type: 'error', text: error instanceof Error ? error.message : 'Inquiry submission failed. Please try again.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen page-navbar-spacing bg-brand-bg pb-16 text-brand-text md:pb-24">
      <section className="relative overflow-hidden border-b border-white/5">
        <div className="pointer-events-none absolute -top-40 left-1/2 h-[34rem] w-[34rem] -translate-x-1/2 rounded-full bg-primary/15 blur-3xl" />
        <div className="pointer-events-none absolute right-[-10rem] top-28 h-[28rem] w-[28rem] rounded-full bg-secondary/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 cyber-grid opacity-[0.08]" />

        <div className="site-container relative z-10 grid gap-10 py-10 md:py-16 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-center lg:py-20">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/25 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-[0.24em] text-primary shadow-lg shadow-primary/10">
              <Sparkles className="h-3.5 w-3.5" />
              Digital Solutions
            </div>
            <h1 className="mt-6 max-w-4xl text-[2.35rem] font-black uppercase leading-[0.98] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.25rem]">
              One Digital Partner for Your Brand, Website & Business Growth
            </h1>
            <p className="mt-6 max-w-3xl text-base font-medium leading-8 text-brand-text/68 md:text-lg">
              We help businesses build everything they need online — from websites, apps, e-commerce stores and SaaS platforms to AI tools, custom software, logos and creative designs.
            </p>
            <div className="mt-5 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-3 text-[10px] font-black uppercase tracking-widest text-brand-text/45 sm:inline-flex">
              Websites • Apps • Stores • AI • SaaS • Branding
            </div>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={() => selectService('')}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-b-4 border-secondary bg-primary px-6 py-4 text-[11px] font-black uppercase tracking-widest text-black shadow-xl shadow-primary/10 transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                Start Your Project
                <ArrowRight className="h-4 w-4 -rotate-45" />
              </button>
              <a
                href="#service-grid"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-6 py-4 text-[11px] font-black uppercase tracking-widest text-brand-text/72 hover:border-primary/35 hover:text-primary"
              >
                View Our Work
                <ArrowRight className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="digital-hero-visual relative min-h-[420px] overflow-hidden rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/40 md:p-6">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_18%,rgba(255,214,0,0.24),transparent_30%),radial-gradient(circle_at_82%_20%,rgba(255,140,42,0.16),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_45%)]" />
            <div className="relative z-10 rounded-[1.5rem] border border-white/10 bg-black/35 p-5 backdrop-blur-xl">
              <div className="mb-5 flex items-center justify-between">
                <div>
                  <div className="text-[9px] font-black uppercase tracking-widest text-brand-text/35">Solution Dashboard</div>
                  <div className="mt-1 text-xl font-black uppercase text-white">Growth System</div>
                </div>
                <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary text-black">
                  <Rocket className="h-6 w-6" />
                </div>
              </div>
              <div className="grid gap-3">
                {['Website + Store', 'AI Automation', 'Brand Identity'].map((item, index) => (
                  <div key={item} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                        {index === 0 ? <Code2 className="h-4 w-4" /> : index === 1 ? <Bot className="h-4 w-4" /> : <Palette className="h-4 w-4" />}
                      </div>
                      <span className="text-xs font-black uppercase tracking-widest text-brand-text/78">{item}</span>
                    </div>
                    <BadgeCheck className="h-4 w-4 text-primary" />
                  </div>
                ))}
              </div>
            </div>
            <div className="digital-floating-card absolute bottom-6 left-5 right-5 rounded-[1.4rem] border border-primary/20 bg-primary px-5 py-4 text-black shadow-2xl shadow-primary/20 md:left-auto md:w-72">
              <div className="text-[9px] font-black uppercase tracking-widest opacity-70">Launch Stack</div>
              <div className="mt-1 text-2xl font-black uppercase leading-none">Design + Build + Scale</div>
            </div>
          </div>
        </div>
      </section>

      <section id="service-grid" className="site-container py-12 md:py-16">
        <div className="mb-8 flex flex-col justify-between gap-4 md:flex-row md:items-end">
          <div>
            <h2 className="text-3xl font-black uppercase text-white md:text-5xl">Services Built For Digital Growth</h2>
            <p className="mt-3 max-w-2xl text-sm leading-7 text-brand-text/55">Pick one service or combine multiple solutions into a full launch system for your business.</p>
          </div>
          {servicesLoading ? <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-primary"><Loader2 className="h-4 w-4 animate-spin" /> Loading live services</div> : null}
        </div>
        {servicesError ? (
          <div className="mb-6 rounded-2xl border border-primary/20 bg-primary/10 px-4 py-3 text-xs font-bold text-primary">{servicesError}</div>
        ) : null}
        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {activeServices.map((service) => (
            <article key={service.id} className="group relative flex h-full min-h-[560px] flex-col overflow-hidden rounded-[2rem] border border-white/10 bg-[#101010]/88 shadow-2xl shadow-black/30 transition-all duration-500 hover:-translate-y-1 hover:border-primary/35 hover:shadow-primary/10">
              <div className="relative aspect-[16/10] overflow-hidden bg-black">
                <UploadedImage
                  src={service.thumbnail || service.image || '/services-card.webp'}
                  fallbackSrc="/services-card.webp"
                  alt={service.title}
                  className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#101010] via-black/22 to-transparent" />
                <div className="absolute left-4 top-4 rounded-full border border-white/15 bg-black/55 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-white/70 backdrop-blur-xl">
                  {service.category}
                </div>
                <div className="absolute bottom-4 left-4 grid h-12 w-12 place-items-center rounded-2xl border border-primary/25 bg-primary text-black shadow-xl shadow-primary/20">
                  {renderServiceIcon(service.icon, 'h-5 w-5')}
                </div>
              </div>

              <div className="flex flex-1 flex-col p-5 md:p-6">
                <div className="mb-3 flex items-center justify-between gap-3">
                  <span className="rounded-full border border-primary/20 bg-primary/10 px-3 py-1.5 text-[8px] font-black uppercase tracking-widest text-primary">
                    {service.badge || 'Digital Solution'}
                  </span>
                  <span className="text-[8px] font-black uppercase tracking-widest text-brand-text/30">
                    {service.delivery || 'Custom Timeline'}
                  </span>
                </div>
                <h3 className="text-[1.7rem] font-black uppercase leading-[0.95] text-white transition-colors group-hover:text-primary md:text-[2rem]">{service.title}</h3>
                <p className="mt-3 text-sm leading-7 text-brand-text/62">{service.shortDescription}</p>
                <ul className="mt-5 grid gap-2.5">
                  {service.bulletPoints.slice(0, 5).map((point) => (
                    <li key={point} className="flex items-center gap-2 text-xs font-bold text-brand-text/60">
                      <CheckCircle2 className="h-4 w-4 shrink-0 text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => selectService(service.title)}
                  className="mt-auto inline-flex items-center justify-center gap-2 rounded-xl border-b-4 border-secondary bg-primary px-4 py-3.5 text-[10px] font-black uppercase tracking-widest text-black shadow-xl shadow-primary/10 transition-transform hover:scale-[1.01] active:scale-[0.99]"
                >
                  Discuss Project
                  <MessageCircle className="h-4 w-4" />
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container py-12 md:py-16">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-black uppercase text-white md:text-5xl">How We Turn Ideas Into Digital Products</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {processSteps.map(([title, description], index) => (
            <article key={title} className="rounded-[1.6rem] border border-white/10 bg-white/[0.035] p-5">
              <div className="mb-4 flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-sm font-black text-black">{index + 1}</div>
              <h3 className="text-lg font-black uppercase text-white">{title}</h3>
              <p className="mt-3 text-sm leading-7 text-brand-text/58">{description}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="site-container py-10 md:py-14">
        <div className="grid gap-8 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <div>
            <h2 className="text-3xl font-black uppercase text-white md:text-5xl">Why Businesses Choose Us</h2>
            <p className="mt-4 text-sm leading-7 text-brand-text/58">You get a complete digital team focused on business results, clean systems and premium presentation.</p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {whyChooseUs.map((point) => (
              <div key={point} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-white/[0.035] px-4 py-4 text-sm font-bold text-brand-text/68">
                <ShieldCheck className="h-5 w-5 shrink-0 text-primary" />
                {point}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section ref={inquiryRef} id="project-inquiry" className="site-container py-12 md:py-16">
        <div className="grid gap-8 rounded-[2rem] border border-white/10 bg-white/[0.035] p-5 shadow-2xl shadow-black/30 md:p-8 lg:grid-cols-[0.82fr_1.18fr]">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
              <Send className="h-3.5 w-3.5" /> Project Inquiry
            </div>
            <h2 className="mt-5 text-3xl font-black uppercase leading-tight text-white md:text-5xl">Ready to Build Something Powerful?</h2>
            <p className="mt-5 text-sm leading-7 text-brand-text/62">
              Tell us your idea, and we will help you turn it into a professional website, app, store, software, SaaS product, AI solution or brand identity.
            </p>
          </div>

          <form onSubmit={submitInquiry} className="grid gap-4">
            <div className="grid gap-4 md:grid-cols-2">
              <input name="name" required value={inquiry.name} onChange={(e) => setInquiry({ ...inquiry, name: e.target.value })} placeholder="Name" className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50" />
              <input name="email" required type="email" value={inquiry.email} onChange={(e) => setInquiry({ ...inquiry, email: e.target.value })} placeholder="Email" className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50" />
              <input name="phone" required value={inquiry.phone} onChange={(e) => setInquiry({ ...inquiry, phone: e.target.value })} placeholder="Phone / WhatsApp" className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50" />
              <input name="company" value={inquiry.company} onChange={(e) => setInquiry({ ...inquiry, company: e.target.value })} placeholder="Company name (optional)" className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50" />
              <select name="selectedService" required value={inquiry.selectedService} onChange={(e) => setInquiry({ ...inquiry, selectedService: e.target.value })} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50">
                <option value="">Select service</option>
                {activeServices.map((service) => <option key={service.slug} value={service.title}>{service.title}</option>)}
              </select>
              <select name="budget" value={inquiry.budget} onChange={(e) => setInquiry({ ...inquiry, budget: e.target.value })} className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50">
                <option value="">Budget range (optional)</option>
                <option value="Under Rs 50,000">Under Rs 50,000</option>
                <option value="Rs 50,000 - Rs 150,000">Rs 50,000 - Rs 150,000</option>
                <option value="Rs 150,000 - Rs 500,000">Rs 150,000 - Rs 500,000</option>
                <option value="Rs 500,000+">Rs 500,000+</option>
              </select>
            </div>
            <textarea name="message" required rows={5} value={inquiry.message} onChange={(e) => setInquiry({ ...inquiry, message: e.target.value })} placeholder="Project details" className="rounded-2xl border border-white/10 bg-black/25 px-4 py-4 text-sm text-brand-text outline-none focus:border-primary/50" />
            <button disabled={submitting} className="inline-flex items-center justify-center gap-2 rounded-xl border-b-4 border-secondary bg-primary px-6 py-4 text-[11px] font-black uppercase tracking-widest text-black disabled:opacity-60">
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              {submitting ? 'Submitting...' : 'Get Free Consultation'}
            </button>
            {submitMessage ? (
              <p className={`rounded-2xl border px-4 py-3 text-sm font-bold ${submitMessage.type === 'success' ? 'border-emerald-400/20 bg-emerald-400/10 text-emerald-300' : 'border-accent/20 bg-accent/10 text-accent'}`}>{submitMessage.text}</p>
            ) : null}
          </form>
        </div>
      </section>

      <section className="site-container py-10 md:py-14">
        <div className="mx-auto max-w-3xl">
          <h2 className="mb-6 text-center text-3xl font-black uppercase text-white md:text-5xl">Digital Solutions FAQ</h2>
          <div className="space-y-3">
            {faqs.map((faq) => (
              <details key={faq.q} className="group rounded-2xl border border-white/10 bg-white/[0.035]">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 px-5 py-4 text-sm font-black uppercase tracking-wide text-white">
                  {faq.q}
                  <ChevronDown className="h-4 w-4 shrink-0 text-primary transition-transform group-open:rotate-180" />
                </summary>
                <p className="border-t border-white/10 px-5 py-4 text-sm leading-7 text-brand-text/62">{faq.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}

