'use client';

import React from 'react';
import Image from 'next/image';
import { Star, Quote } from 'lucide-react';

const testimonials = [
  {
    name: 'Sarah Johnson',
    role: 'Digital Creator',
    content: 'SubHammad has completely changed how I manage my tools. The instant delivery is real, and the prices are unbeatable!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=sarah'
  },
  {
    name: 'Michael Chen',
    role: 'Software Engineer',
    content: 'I was skeptical at first, but the support team is incredible. They helped me set up my ChatGPT Plus in minutes.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=michael'
  },
  {
    name: 'Elena Rodriguez',
    role: 'Student',
    content: 'Perfect for students on a budget. I can get all the premium tools I need for my studies without breaking the bank.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=elena'
  },
  {
    name: 'David Lee',
    role: 'Entrepreneur',
    content: 'The efficiency and cost-effectiveness of SubHammad are unmatched. A must-have for any serious professional.',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=david'
  },
  {
    name: 'Jessica Kim',
    role: 'Graphic Designer',
    content: 'Access to premium design tools at such low prices? It\'s a game-changer for my freelance business!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=jessica'
  },
  {
    name: 'Omar Hassan',
    role: 'Marketing Specialist',
    content: 'SubHammad helped me scale my marketing efforts without draining my budget. Highly recommend their services!',
    rating: 5,
    avatar: 'https://i.pravatar.cc/150?u=omar'
  }
];

interface Testimonial {
  name: string;
  role: string;
  content: string;
  rating: number;
  avatar: string;
}

const TestimonialCard = ({ t }: { t: Testimonial; i: number }) => (
  <div className="rounded-[1.5rem] sm:rounded-[2rem] p-4 sm:p-5 md:p-6 border border-white/8 bg-[#141414] relative transition-colors duration-200 w-full flex-shrink-0">
    <Quote className="absolute top-4 right-6 w-8 h-8 text-primary/10" />

    <div className="flex items-center space-x-1 mb-4 text-primary">
      {[...Array(t.rating)].map((_, starIdx) => <Star key={starIdx} className="w-2.5 h-2.5 fill-current" />)}
    </div>

    <p className="text-brand-text/72 mb-5 sm:mb-6 leading-relaxed italic text-[10px] sm:text-[11px] font-medium line-clamp-3 min-h-[48px]">
      &quot;{t.content}&quot;
    </p>

    <div className="flex items-center space-x-3">
      <div className="p-0.5 rounded-xl bg-primary/10 border border-primary/20 w-10 h-10 relative overflow-hidden">
        <Image
          src={t.avatar}
          alt={t.name}
          fill
          className="object-cover"
          referrerPolicy="no-referrer"
        />
      </div>
      <div>
        <h4 className="font-black text-brand-text text-[10px] sm:text-[11px] uppercase leading-none">{t.name}</h4>
        <p className="text-[7px] sm:text-[8px] text-brand-text/40 font-black uppercase tracking-widest mt-1">{t.role}</p>
      </div>
    </div>
  </div>
);

const Testimonials = () => {
  const firstRow = testimonials.slice(0, 3);
  const secondRow = testimonials.slice(3, 6);

  return (
    <section className="pt-10 pb-6 md:pt-20 md:pb-12 relative bg-brand-bg overflow-hidden">
      <div className="site-container">
        <div className="text-center mb-8 md:mb-20">
          <h2
            data-gsap-reveal="gsap"
            className="text-3xl md:text-7xl font-black mb-3 md:mb-6 text-brand-text uppercase"
          >
            <span className="font-serif italic text-white normal-case">What Our</span> <span className="internal-gradient">Legends</span> Say
          </h2>
          <p className="text-brand-text/60 text-[10px] md:text-sm font-black uppercase tracking-widest">Join 10,000+ satisfied users worldwide.</p>
        </div>

        <div className="relative space-y-4 md:space-y-8 -mx-4 sm:-mx-6 lg:-mx-8">
          <div className="pointer-events-none absolute inset-y-0 left-0 w-16 sm:w-24 lg:w-40 bg-gradient-to-r from-brand-bg to-transparent z-10" />
          <div className="pointer-events-none absolute inset-y-0 right-0 w-16 sm:w-24 lg:w-40 bg-gradient-to-l from-brand-bg to-transparent z-10" />

          <div className="testimonial-marquee">
            <div className="testimonial-marquee-track">
              {[...firstRow, ...firstRow].map((t, i) => (
                <div key={`row-1-${i}`} className="mx-2 sm:mx-3 md:mx-4 w-[220px] sm:w-[260px] md:w-[320px] lg:w-[360px] shrink-0">
                  <TestimonialCard t={t} i={i} />
                </div>
              ))}
            </div>
          </div>

          <div className="testimonial-marquee">
            <div className="testimonial-marquee-track testimonial-marquee-track-reverse">
              {[...secondRow, ...secondRow].map((t, i) => (
                <div key={`row-2-${i}`} className="mx-2 sm:mx-3 md:mx-4 w-[220px] sm:w-[260px] md:w-[320px] lg:w-[360px] shrink-0">
                  <TestimonialCard t={t} i={i} />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Testimonials;
