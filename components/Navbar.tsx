'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { Loader2, Menu, Search, ShoppingBag, User, X } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { collection, limit, onSnapshot, query } from 'firebase/firestore';
import { db } from '@/firebase';
import { toSlugFromTitle } from '@/lib/seo';

type SearchResult = {
  id: string;
  label: string;
  sub: string;
  href: string;
};

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();
  const { user, profile } = useAuth();
  const { totalItems, setIsCartOpen } = useCart();
  const isAdminRoute = pathname.startsWith('/admin');
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      document.body.setAttribute('data-scroll-locked', 'true');
      return;
    }
    document.body.removeAttribute('data-scroll-locked');

    return () => {
      document.body.removeAttribute('data-scroll-locked');
    };
  }, [isOpen]);

  const desktopNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blogs' },
    { name: 'Giveaway', href: '/giveaway' },
    { name: 'About', href: '/about' },
  ];

  const mobileNavLinks = [
    { name: 'Home', href: '/' },
    { name: 'Tools', href: '/tools' },
    { name: 'Services', href: '/services' },
    { name: 'Blog', href: '/blogs' },
    { name: 'Giveaway', href: '/giveaway' },
    { name: 'About', href: '/about' },
  ];

  useEffect(() => {
    if (!searchOpen || !searchTerm.trim()) {
      const resetTimer = window.setTimeout(() => {
        setSearchResults([]);
        setSearchLoading(false);
      }, 0);
      return () => window.clearTimeout(resetTimer);
    }

    let unsubscribers: Array<() => void> = [];
    const startTimer = window.setTimeout(() => {
      setSearchLoading(true);
      const needle = searchTerm.trim().toLowerCase();
      const resultMap = new Map<string, SearchResult>();

      function publish() {
        setSearchResults(Array.from(resultMap.values()).slice(0, 10));
        setSearchLoading(false);
      }

      unsubscribers = [
        onSnapshot(query(collection(db, 'services'), limit(80)), (snapshot) => {
          Array.from(resultMap.keys())
            .filter((key) => key.startsWith('tool-'))
            .forEach((key) => resultMap.delete(key));
          snapshot.docs.forEach((entry) => {
            const data = entry.data() as Record<string, any>;
            if ((data.active === false) || ((data.type || 'tools') !== 'tools')) return;
            const title = String(data.title || data.name || 'Tool');
            const slug = toSlugFromTitle(String(data.slug || title)) || entry.id;
            const haystack = `${title} ${data.description || ''} ${data.categoryName || data.category || ''}`.toLowerCase();
            if (haystack.includes(needle)) {
              resultMap.set(`tool-${entry.id}`, {
                id: `tool-${entry.id}`,
                label: title,
                sub: 'Tool',
                href: `/tools/${slug}`,
              });
            }
          });
          publish();
        }),
        onSnapshot(query(collection(db, 'blogPosts'), limit(50)), (snapshot) => {
          Array.from(resultMap.keys())
            .filter((key) => key.startsWith('blog-'))
            .forEach((key) => resultMap.delete(key));
          snapshot.docs.forEach((entry) => {
            const data = entry.data() as Record<string, any>;
            const published = data.published === true || String(data.status || '').toLowerCase() === 'published';
            if (!published) return;
            const title = String(data.title || 'Blog');
            const slug = toSlugFromTitle(String(data.slug || title)) || entry.id;
            const haystack = `${title} ${data.shortDescription || data.excerpt || data.content || ''}`.toLowerCase();
            if (haystack.includes(needle)) {
              resultMap.set(`blog-${entry.id}`, {
                id: `blog-${entry.id}`,
                label: title,
                sub: 'Blog',
                href: `/blogs/${slug}`,
              });
            }
          });
          publish();
        }),
        onSnapshot(query(collection(db, 'giveaways'), limit(30)), (snapshot) => {
          Array.from(resultMap.keys())
            .filter((key) => key.startsWith('giveaway-'))
            .forEach((key) => resultMap.delete(key));
          snapshot.docs.forEach((entry) => {
            const data = entry.data() as Record<string, any>;
            const title = String(data.title || 'Giveaway');
            const haystack = `${title} ${data.description || data.prize || ''}`.toLowerCase();
            if (haystack.includes(needle)) {
              resultMap.set(`giveaway-${entry.id}`, {
                id: `giveaway-${entry.id}`,
                label: title,
                sub: 'Giveaway',
                href: '/giveaway',
              });
            }
          });
          publish();
        }),
      ];
    }, 0);

    return () => {
      window.clearTimeout(startTimer);
      unsubscribers.forEach((unsubscribe) => unsubscribe());
    };
  }, [searchOpen, searchTerm]);

  function openFirstSearchResult() {
    const firstResult = searchResults[0];
    if (!firstResult) {
      return;
    }
    window.location.href = firstResult.href;
  }

  if (isAdminRoute) return null;

  return (
    <nav className="fixed top-[var(--promo-ticker-height)] left-0 right-0 z-[100] glass mobile-nav-clean py-2.5">
      <div className="site-container">
        <div className="flex items-center justify-between gap-2">
          <Link href="/" className="flex min-w-0 items-center gap-2.5 transition-transform hover:scale-105 active:scale-95 group sm:gap-3">
            <div className="relative h-10 w-10 shrink-0 sm:h-11 sm:w-11">
              <Image 
                src="/logo-header.png" 
                alt="Hammad Tools Logo" 
                fill
                className="object-contain"
                priority
              />
            </div>
            <span className="navbar-brand-text truncate text-base sm:text-xl 2xl:text-2xl font-black text-brand-text uppercase leading-none tracking-[0.03em]">
              Hammad<span className="internal-gradient">Tools</span>
            </span>
          </Link>

          {/* Desktop Nav */}
          <div className="hidden xl:flex items-center flex-1 ml-8">
            <div className="flex items-center justify-center flex-1 gap-7 2xl:gap-10">
              {desktopNavLinks.map((link) => (
                <Link
                  key={link.name}
                  href={link.href}
                  className={`text-[11px] 2xl:text-[12px] font-black uppercase tracking-[0.16em] transition-colors hover:text-primary ${pathname === link.href ? 'text-primary' : 'text-brand-text/40'}`}
                >
                  {link.name}
                </Link>
              ))}
            </div>
            
            <div className="flex items-center space-x-4 2xl:space-x-5 ml-8 shrink-0">
              <button
                onClick={() => setSearchOpen((prev) => !prev)}
                className="p-2 hover:bg-white/5 rounded-full transition-colors group"
                aria-label="Open search"
              >
                <Search className="w-6 h-6 text-brand-text/40 group-hover:text-primary" />
              </button>

              <button 
                onClick={() => setIsCartOpen(true)}
                className="relative p-2 hover:bg-white/5 rounded-full transition-colors group"
              >
                <ShoppingBag className="w-6 h-6 text-brand-text/40 group-hover:text-primary" />
                {totalItems > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 bg-primary text-brand-bg text-[10px] font-black rounded-full flex items-center justify-center border border-[#FF8C2A]">
                    {totalItems}
                  </span>
                )}
              </button>

              {user ? (
                <div className="flex items-center border-l border-white/5 pl-4">
                  <Link href="/dashboard" className="w-10 h-10 rounded-xl overflow-hidden border border-primary/20 relative cursor-pointer hover:border-primary/50 transition-all hover:scale-105">
                    <Image 
                      src={profile?.photoURL || `https://ui-avatars.com/api/?name=${profile?.displayName}`} 
                      alt="Profile" 
                      fill
                      className="object-cover"
                      referrerPolicy="no-referrer"
                    />
                  </Link>
                </div>
              ) : (
                <Link
                  href="/login"
                  className="bg-primary hover:bg-primary/90 text-brand-bg px-5 2xl:px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-[0.14em] transition-all hover:scale-105 active:scale-95 border-b-4 border-[#FF8C2A] shadow-lg shadow-primary/10 inline-flex items-center justify-center"
                >
                  Login
                </Link>
              )}
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="xl:hidden ml-1 flex shrink-0 items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => setSearchOpen((prev) => !prev)}
              className="grid h-9 w-9 place-items-center rounded-lg text-brand-text/50 hover:bg-white/5 hover:text-primary"
              aria-label="Open search"
            >
              <Search className="w-5 h-5" />
            </button>
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative grid h-9 w-9 place-items-center rounded-lg text-brand-text/50 hover:bg-white/5 hover:text-primary"
              aria-label="Open cart"
            >
              <ShoppingBag className="w-5 h-5" />
              {totalItems > 0 && (
                <span className="absolute -right-1 -top-1 flex h-[18px] min-w-[18px] items-center justify-center rounded-full border border-[#FF8C2A] bg-primary px-1 text-[9px] font-black text-brand-bg">
                  {totalItems}
                </span>
              )}
            </button>
            <button
              onClick={() => setIsOpen(!isOpen)}
              data-open={isOpen ? 'true' : 'false'}
              className="mobile-menu-toggle relative grid h-9 w-9 place-items-center rounded-lg text-brand-text/50 hover:bg-white/5 hover:text-primary"
              aria-label={isOpen ? 'Close menu' : 'Open menu'}
            >
              <Menu className="mobile-menu-icon mobile-menu-icon-open absolute inset-0 m-auto" />
              <X className="mobile-menu-icon mobile-menu-icon-close absolute inset-0 m-auto" />
            </button>
          </div>
        </div>
      </div>

      <div
        data-open={searchOpen ? 'true' : 'false'}
        aria-hidden={!searchOpen}
        className="public-search-panel border-t border-white/5 bg-[#0A0A0A]/95 backdrop-blur-2xl"
      >
        <div className="site-container py-3">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-brand-text/35" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === 'Enter') {
                  openFirstSearchResult();
                }
                if (event.key === 'Escape') {
                  setSearchOpen(false);
                }
              }}
              placeholder="Search tools, blogs, giveaways..."
              className="w-full rounded-xl border border-white/10 bg-white/[0.04] py-3 pl-11 pr-11 text-sm text-brand-text outline-none focus:border-primary/45"
              autoFocus={searchOpen}
            />
            <button
              type="button"
              onClick={() => setSearchOpen(false)}
              className="absolute right-2 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-lg text-brand-text/50 hover:bg-white/5 hover:text-brand-text"
              aria-label="Close search"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {searchTerm.trim() ? (
            <div className="mt-3 overflow-hidden rounded-xl border border-white/10 bg-black/45">
              {searchLoading ? (
                <div className="flex items-center justify-center gap-2 px-4 py-4 text-[11px] font-black uppercase tracking-widest text-brand-text/45">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                  Searching
                </div>
              ) : searchResults.length ? (
                <div className="divide-y divide-white/5">
                  {searchResults.map((result) => (
                    <Link
                      key={result.id}
                      href={result.href}
                      onClick={() => setSearchOpen(false)}
                      className="flex items-center justify-between gap-3 px-4 py-3 hover:bg-white/5"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-bold text-brand-text">{result.label}</span>
                        <span className="block text-[10px] font-black uppercase tracking-widest text-brand-text/35">{result.sub}</span>
                      </span>
                      <span className="text-[10px] font-black uppercase tracking-widest text-primary">Open</span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="px-4 py-4 text-center text-[11px] font-black uppercase tracking-widest text-brand-text/35">
                  No results found
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>

      {/* Mobile Nav */}
      <div
        data-open={isOpen ? 'true' : 'false'}
        className="mobile-nav-panel xl:hidden bg-gradient-to-b from-[#0A0A0A] to-[#121212] border-t border-white/5 overflow-hidden shadow-2xl"
      >
        <div className="mobile-nav-panel-content px-4 pt-2 pb-10 space-y-1">
          {mobileNavLinks.map((link, index) => (
            <Link
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              style={{ ['--nav-item-index' as string]: String(index + 1) }}
              className={`mobile-nav-link block px-3 py-4 text-lg font-black uppercase tracking-[0.16em] ${pathname === link.href ? 'text-primary' : 'text-brand-text/40'}`}
            >
              {link.name}
            </Link>
          ))}
          <div style={{ ['--nav-item-index' as string]: '8' }} className="mobile-nav-link pt-6 border-t border-white/5 mx-3">
            {user ? (
              <div className="flex items-center justify-between">
                <Link href="/dashboard" onClick={() => setIsOpen(false)} className="flex items-center space-x-3 text-brand-text/40 font-black uppercase tracking-widest text-sm">
                  <User className="w-5 h-5" />
                  <span>My Profile</span>
                </Link>
              </div>
            ) : (
              <Link
                href="/login"
                onClick={() => setIsOpen(false)}
                className="w-full bg-primary text-brand-bg py-5 rounded-xl font-black uppercase tracking-widest text-sm border-b-4 border-[#FF8C2A] shadow-lg shadow-primary/10 inline-flex items-center justify-center"
              >
                Login
              </Link>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;

