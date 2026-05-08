'use client';

import { useEffect, useState } from 'react';
import { Bell, MessageCircle, X } from 'lucide-react';
import { usePathname } from 'next/navigation';

const WHATSAPP_CHANNEL_URL = 'https://whatsapp.com/channel/0029VaoX5ax8V0tjn0fc1j08';
const NOTIFICATION_SESSION_KEY = 'hammadtools_notification_permission_prompted_session';

async function requestNotifications() {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return;
  }
  if (Notification.permission !== 'default') {
    return;
  }
  try {
    await Notification.requestPermission();
  } catch {
    // Browser can reject non-gesture permission prompts; the CTA can retry from a click.
  }
}

export default function EngagementPrompt() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);
  const isAdminRoute = pathname.startsWith('/admin');

  useEffect(() => {
    if (isAdminRoute || typeof window === 'undefined') {
      return;
    }

    const popupDelay = 12_000 + Math.floor(Math.random() * 6_000);
    const popupTimer = window.setTimeout(() => {
      if (!document.hidden) {
        setVisible(true);
      }
    }, popupDelay);

    const popupInterval = window.setInterval(() => {
      if (!document.hidden) {
        setVisible(true);
      }
    }, 30_000);

    const notificationDelay = 10_000 + Math.floor(Math.random() * 10_000);
    const notificationTimer = window.setTimeout(() => {
      if (
        'Notification' in window &&
        Notification.permission === 'default' &&
        sessionStorage.getItem(NOTIFICATION_SESSION_KEY) !== '1'
      ) {
        sessionStorage.setItem(NOTIFICATION_SESSION_KEY, '1');
        void requestNotifications();
      }
    }, notificationDelay);

    return () => {
      window.clearTimeout(popupTimer);
      window.clearTimeout(notificationTimer);
      window.clearInterval(popupInterval);
    };
  }, [isAdminRoute]);

  if (!visible || isAdminRoute) {
    return null;
  }

  function dismiss() {
    setVisible(false);
  }

  async function handleEnableAndJoin() {
    await requestNotifications();
    window.open(WHATSAPP_CHANNEL_URL, '_blank', 'noopener,noreferrer');
    dismiss();
  }

  return (
    <div className="fixed inset-x-3 bottom-4 z-[120] sm:left-auto sm:right-5 sm:w-[390px]">
      <div className="rounded-2xl border border-primary/30 bg-[#101010]/95 p-4 shadow-[0_22px_70px_rgba(0,0,0,0.55)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="grid h-10 w-10 place-items-center rounded-xl border border-primary/25 bg-primary/10 text-primary">
              <Bell className="h-5 w-5" />
            </div>
            <div>
              <div className="text-sm font-black uppercase tracking-wide text-brand-text">
                Free courses & consultancy available
              </div>
              <div className="mt-1 text-xs leading-relaxed text-brand-text/58">
                Join WhatsApp channel & enable notifications.
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={dismiss}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg border border-white/10 bg-white/[0.03] text-brand-text/55 hover:text-brand-text"
            aria-label="Close popup"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <button
          type="button"
          onClick={() => {
            void handleEnableAndJoin();
          }}
          className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-xl border border-primary/35 bg-primary px-4 py-3 text-[11px] font-black uppercase tracking-widest text-black shadow-lg shadow-primary/10"
        >
          <MessageCircle className="h-4 w-4" />
          Join Channel
        </button>
      </div>
    </div>
  );
}
