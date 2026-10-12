export interface Consent {
  version: '1.0';
  timestamp: string;
  categories: {
    necessary: true;
    analytics: boolean;
    marketing: boolean;
    functional: boolean;
  };
}

const NAME = 'sg_cookie_consent';

export function readConsent(): Consent | null {
  const raw = document.cookie
    .split('; ')
    .find((part) => part.startsWith(`${NAME}=`))
    ?.slice(NAME.length + 1);
  if (!raw) return null;
  try {
    const consent = JSON.parse(decodeURIComponent(raw)) as Consent;
    return consent.version === '1.0' ? consent : null;
  } catch {
    return null;
  }
}

export function saveConsent(categories: Consent['categories']): Consent {
  const consent: Consent = {
    version: '1.0',
    timestamp: new Date().toISOString(),
    categories,
  };
  const expires = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toUTCString();
  document.cookie = `${NAME}=${encodeURIComponent(JSON.stringify(consent))};expires=${expires};path=/;SameSite=Lax`;
  localStorage.setItem(NAME, JSON.stringify(consent));
  document.dispatchEvent(new CustomEvent('cookieConsentChanged', { detail: consent }));
  return consent;
}

export function mountConsent(): void {
  const banner = document.querySelector<HTMLElement>('#cookie-banner');
  if (!banner || readConsent()) return;
  banner.hidden = false;
  document.querySelector('#cookie-necessary')?.addEventListener('click', () => {
    saveConsent({ necessary: true, analytics: false, marketing: false, functional: false });
    banner.hidden = true;
  });
  document.querySelector('#cookie-all')?.addEventListener('click', () => {
    saveConsent({ necessary: true, analytics: true, marketing: true, functional: true });
    banner.hidden = true;
    loadThirdParties();
  });
}

export function loadThirdParties(): void {
  const flags = (window as Window & { __sgFlags?: { ads: boolean; analytics: boolean } }).__sgFlags;
  const consent = readConsent();
  if (!flags || !consent) return;
  if (flags.analytics && consent.categories.analytics && !document.querySelector('[data-sg="gtm"]')) {
    const script = document.createElement('script');
    script.dataset.sg = 'gtm';
    script.src = 'https://www.googletagmanager.com/gtm.js?id=GTM-WBJXS2PX';
    script.async = true;
    document.head.appendChild(script);
  }
  if (flags.ads && consent.categories.marketing && !document.querySelector('[data-sg="ads"]')) {
    const script = document.createElement('script');
    script.dataset.sg = 'ads';
    script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-3884162231581435';
    script.async = true;
    script.crossOrigin = 'anonymous';
    document.head.appendChild(script);
  }
}
