import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle2, MessageCircle, Sparkles, Tag } from 'lucide-react';
import UploadedImage from '@/components/UploadedImage';
import {
  buildSeoDescription,
  createAutoPageMetadata,
  createPageMetadata,
  toAbsoluteSiteUrl,
} from '@/lib/seo';
import { toMetadataImageUrl } from '@/lib/image-display';
import { getAgencyServiceBySlug } from '@/lib/server/agency-services';

type PageParams = { slug: string };

export const dynamic = 'force-dynamic';

function buildFeatureList(service: { title: string; description: string; tags: string[] }) {
  const fromTags = service.tags.slice(0, 6);
  const fallback = [
    'Custom project scope',
    'Professional delivery',
    'Secure payment proof flow',
    'Direct support response',
  ];
  const source = fromTags.length ? fromTags : fallback;
  return source.map((item) => item.trim()).filter(Boolean);
}

function normalizeDisplayTitle(value: string) {
  return value.replace(/\s+/g, ' ').trim();
}

export async function generateMetadata({
  params,
}: {
  params: Promise<PageParams>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = await getAgencyServiceBySlug(slug);

  if (!service) {
    return createPageMetadata({
      title: 'Service Not Found',
      description: 'The requested service could not be found.',
      path: `/services/${slug}`,
      noIndex: true,
    });
  }

  const serviceTitle = normalizeDisplayTitle(service.title);
  const metadataImage = toMetadataImageUrl(service.thumbnail) || '/services-card.webp';
  return createAutoPageMetadata({
    title: `${serviceTitle} | Hammad Tools Services`,
    path: `/services/${service.slug}`,
    image: metadataImage,
    shortDescription: service.description,
    fallbackDescription: `${serviceTitle} service by Hammad Tools with fast delivery and professional support in Pakistan.`,
    keywords: [
      'hammad tools services',
      serviceTitle,
      `${serviceTitle} Pakistan`,
      ...service.tags,
    ],
  });
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<PageParams>;
}) {
  const { slug } = await params;
  const service = await getAgencyServiceBySlug(slug);

  if (!service) {
    notFound();
  }

  const imageSrc = service.thumbnail || '/services-card.webp';
  const serviceTitle = normalizeDisplayTitle(service.title);
  const serviceUrl = toAbsoluteSiteUrl(`/services/${service.slug}`);
  const serviceImage = imageSrc.startsWith('http')
    ? imageSrc
    : toAbsoluteSiteUrl(imageSrc);
  const serviceDescription = buildSeoDescription(
    [service.description],
    `${serviceTitle} service by Hammad Tools.`,
    200
  );
  const features = buildFeatureList({ ...service, title: serviceTitle });
  const requestHref = `/services?request=${encodeURIComponent(serviceTitle)}`;

  const serviceSchema = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: serviceTitle,
    serviceType: serviceTitle,
    description: serviceDescription,
    image: [serviceImage],
    provider: {
      '@type': 'Organization',
      name: 'Hammad Tools',
      url: toAbsoluteSiteUrl('/'),
    },
    areaServed: 'PK',
    url: serviceUrl,
  };

  return (
    <main className="min-h-screen page-navbar-spacing pb-16 md:pb-24 bg-brand-bg">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceSchema) }}
      />

      <div className="site-container">
        <Link
          href="/services"
          className="inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-brand-text/60 hover:text-primary transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back To Services
        </Link>

        <section className="mt-6 grid gap-8 lg:grid-cols-[minmax(0,1.04fr)_minmax(360px,0.96fr)] lg:items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-lg border border-primary/20 bg-primary/10 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-primary">
              <Sparkles className="h-3.5 w-3.5" />
              Premium Service
            </div>

            <h1 className="mt-5 max-w-4xl text-4xl md:text-6xl font-black text-brand-text leading-[0.98]">
              {serviceTitle}
            </h1>

            <p className="mt-5 max-w-3xl text-base md:text-lg leading-8 text-brand-text/70 whitespace-pre-wrap">
              {service.description || 'Contact Hammad Tools for service details and a custom quote.'}
            </p>

            {service.tags.length ? (
              <div className="mt-6 flex flex-wrap gap-2">
                {service.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 rounded-lg border border-white/15 bg-white/[0.04] px-3 py-1.5 text-[10px] font-black uppercase tracking-wider text-brand-text/70"
                  >
                    <Tag className="w-3 h-3 text-primary" />
                    {tag}
                  </span>
                ))}
              </div>
            ) : null}

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href={requestHref}
                className="inline-flex items-center justify-center gap-2 rounded-xl border-b-4 border-secondary bg-primary px-5 py-4 text-[11px] font-black uppercase tracking-widest text-black transition-transform hover:scale-[1.01] active:scale-[0.99]"
              >
                <MessageCircle className="w-4 h-4" />
                Request Service
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-5 py-4 text-[11px] font-black uppercase tracking-widest text-brand-text/70 hover:border-primary/35 hover:text-primary"
              >
                Explore Services
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/30 shadow-2xl shadow-black/30">
            <UploadedImage
              src={imageSrc}
              fallbackSrc="/services-card.webp"
              alt={serviceTitle}
              className="aspect-[16/10] w-full object-cover"
            />
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-xl md:text-2xl font-black text-brand-text">What you get</h2>
            <span className="hidden sm:block h-px flex-1 bg-gradient-to-r from-primary/40 to-transparent" />
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            {features.map((feature) => (
              <div
                key={feature}
                className="rounded-xl border border-white/10 bg-white/[0.035] p-4"
              >
                <CheckCircle2 className="mb-3 h-5 w-5 text-primary" />
                <div className="text-sm font-black text-brand-text leading-snug">{feature}</div>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
