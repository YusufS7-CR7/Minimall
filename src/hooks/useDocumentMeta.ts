import { useEffect } from "react";

interface DocumentMetaOptions {
  /** Browser tab title */
  title: string;
  /** Meta description content */
  description?: string;
  /** Image URL for Open Graph & Twitter Cards */
  image?: string;
  /** Schema.org structured data object (JSON-LD) */
  structuredData?: Record<string, unknown>;
  /** If true, inject noindex meta (e.g., search result pages) */
  noIndex?: boolean;
  /** Canonical URL for this page */
  canonical?: string;
}

/**
 * Sets document.title, meta description, canonical link, and optional
 * JSON-LD structured data on mount; cleans up injected nodes on unmount.
 *
 * This is the CSR (client-side rendering) approach. When the project
 * migrates to SSR (Next.js, Remix, etc.) this hook can be replaced by
 * the framework's <Head> / metadata API with zero changes to call sites.
 */
export function useDocumentMeta({
  title,
  description,
  image,
  structuredData,
  noIndex = false,
  canonical,
}: DocumentMetaOptions) {
  useEffect(() => {
    // ── Title ──────────────────────────────────────────────────────────
    const prevTitle = document.title;
    document.title = title;

    // ── Description ────────────────────────────────────────────────────
    let descMeta = document.querySelector<HTMLMetaElement>(
      "meta[name='description']"
    );
    const descCreated = !descMeta;
    if (!descMeta) {
      descMeta = document.createElement("meta");
      descMeta.setAttribute("name", "description");
      document.head.appendChild(descMeta);
    }
    const prevDesc = descMeta.getAttribute("content") || "";
    if (description) descMeta.setAttribute("content", description);

    // ── Robots noindex ─────────────────────────────────────────────────
    let robotsMeta = document.querySelector<HTMLMetaElement>(
      "meta[name='robots'][data-dynamic]"
    );
    if (noIndex && !robotsMeta) {
      robotsMeta = document.createElement("meta");
      robotsMeta.setAttribute("name", "robots");
      robotsMeta.setAttribute("content", "noindex, follow");
      robotsMeta.setAttribute("data-dynamic", "true");
      document.head.appendChild(robotsMeta);
    }

    // ── Canonical ──────────────────────────────────────────────────────
    let canonicalLink = document.querySelector<HTMLLinkElement>(
      "link[rel='canonical'][data-dynamic]"
    );
    if (canonical && !canonicalLink) {
      canonicalLink = document.createElement("link");
      canonicalLink.setAttribute("rel", "canonical");
      canonicalLink.setAttribute("data-dynamic", "true");
      document.head.appendChild(canonicalLink);
    }
    if (canonicalLink && canonical) {
      canonicalLink.setAttribute("href", canonical);
    }

    // ── JSON-LD Structured Data ────────────────────────────────────────
    let ldScript = document.querySelector<HTMLScriptElement>(
      "script[type='application/ld+json'][data-dynamic]"
    );
    if (structuredData) {
      if (!ldScript) {
        ldScript = document.createElement("script");
        ldScript.setAttribute("type", "application/ld+json");
        ldScript.setAttribute("data-dynamic", "true");
        document.head.appendChild(ldScript);
      }
      ldScript.textContent = JSON.stringify(structuredData);
    }

    // ── Open Graph & Twitter Image ────────────────────────────────────
    let ogImgMeta = document.querySelector<HTMLMetaElement>("meta[property='og:image']");
    let twImgMeta = document.querySelector<HTMLMetaElement>("meta[name='twitter:image']");
    const prevOgImg = ogImgMeta?.getAttribute("content") || "";
    const prevTwImg = twImgMeta?.getAttribute("content") || "";

    if (image) {
      if (!ogImgMeta) {
        ogImgMeta = document.createElement("meta");
        ogImgMeta.setAttribute("property", "og:image");
        document.head.appendChild(ogImgMeta);
      }
      ogImgMeta.setAttribute("content", image);

      if (!twImgMeta) {
        twImgMeta = document.createElement("meta");
        twImgMeta.setAttribute("name", "twitter:image");
        document.head.appendChild(twImgMeta);
      }
      twImgMeta.setAttribute("content", image);
    }

    // ── Cleanup ────────────────────────────────────────────────────────
    return () => {
      document.title = prevTitle;
      if (description && descMeta) {
        if (descCreated) {
          descMeta.remove();
        } else {
          descMeta.setAttribute("content", prevDesc);
        }
      }
      if (image) {
        if (ogImgMeta) ogImgMeta.setAttribute("content", prevOgImg);
        if (twImgMeta) twImgMeta.setAttribute("content", prevTwImg);
      }
      if (noIndex && robotsMeta) robotsMeta.remove();
      if (canonicalLink) canonicalLink.remove();
      if (ldScript) ldScript.remove();
    };
  }, [title, description, image, structuredData, noIndex, canonical]);
}
