import { useEffect } from 'react';

interface SeoMeta {
  title: string;
  description: string;
  canonical: string;
  ogTitle?: string;
  ogDescription?: string;
}

function setMetaTag(selector: string, attrName: string, attrValue: string, contentAttr: string, content: string) {
  let el = document.querySelector(selector) as HTMLMetaElement | null;
  if (!el) {
    el = document.createElement('meta') as HTMLMetaElement;
    el.setAttribute(attrName, attrValue);
    document.head.appendChild(el);
  }
  el.setAttribute(contentAttr, content);
}

function setLinkTag(rel: string, href: string) {
  let el = document.querySelector(`link[rel="${rel}"]`) as HTMLLinkElement | null;
  if (!el) {
    el = document.createElement('link') as HTMLLinkElement;
    el.setAttribute('rel', rel);
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

/**
 * Lightweight per-page SEO head manager for Vite/React SPA.
 * Updates document.title and key meta tags without a full Helmet library.
 * Restores original values on unmount so navigating back to home is clean.
 */
export function useSeoMeta(meta: SeoMeta) {
  useEffect(() => {
    const prevTitle = document.title;
    const prevDesc = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    const prevCanonical = document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? '';
    const prevOgTitle = document.querySelector('meta[property="og:title"]')?.getAttribute('content') ?? '';
    const prevOgDesc = document.querySelector('meta[property="og:description"]')?.getAttribute('content') ?? '';
    const prevTwitterTitle = document.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ?? '';
    const prevTwitterDesc = document.querySelector('meta[name="twitter:description"]')?.getAttribute('content') ?? '';

    document.title = meta.title;

    setMetaTag('meta[name="description"]', 'name', 'description', 'content', meta.description);
    setLinkTag('canonical', meta.canonical);

    const ogTitle = meta.ogTitle ?? meta.title;
    const ogDesc = meta.ogDescription ?? meta.description;

    setMetaTag('meta[property="og:title"]', 'property', 'og:title', 'content', ogTitle);
    setMetaTag('meta[property="og:description"]', 'property', 'og:description', 'content', ogDesc);
    setMetaTag('meta[property="og:url"]', 'property', 'og:url', 'content', meta.canonical);
    setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', 'content', ogTitle);
    setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', 'content', ogDesc);

    return () => {
      document.title = prevTitle;
      setMetaTag('meta[name="description"]', 'name', 'description', 'content', prevDesc);
      setLinkTag('canonical', prevCanonical);
      setMetaTag('meta[property="og:title"]', 'property', 'og:title', 'content', prevOgTitle);
      setMetaTag('meta[property="og:description"]', 'property', 'og:description', 'content', prevOgDesc);
      setMetaTag('meta[name="twitter:title"]', 'name', 'twitter:title', 'content', prevTwitterTitle);
      setMetaTag('meta[name="twitter:description"]', 'name', 'twitter:description', 'content', prevTwitterDesc);
    };
  }, [meta.title, meta.description, meta.canonical, meta.ogTitle, meta.ogDescription]);
}
