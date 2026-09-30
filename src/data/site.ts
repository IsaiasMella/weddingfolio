/**
 * Datos globales del sitio: identidad, contacto y navegación.
 *
 * Es la única fuente de verdad para textos que se repiten en el header, el
 * footer, el SEO (JSON-LD) y los archivos para IA (llms.txt). Equivale a un
 * `siteConfig` en un proyecto Next.
 */
export const SITE = {
  name: 'Elena & Co.',
  tagline: 'Wedding Photography',
  /** Título de la home y sufijo del resto de páginas ("About · Elena & Co."). */
  title: 'Elena & Co. — Timeless Wedding Photography',
  description:
    'Editorial wedding photography for couples who value emotion, craft, and quiet luxury. Based in California, available worldwide.',
  author: 'Elena Moreau',
  url: 'https://weddingfolio.example.com',
  locale: 'en_US',
  lang: 'en',
  email: 'hello@example.com',
  phone: '+1 (555) 010-2040',
  location: {
    locality: 'Napa Valley',
    region: 'California',
    country: 'United States',
  },
  priceRange: '$$–$$$',
  /** Imagen social por defecto (og:image) y del JSON-LD. */
  defaultImage: {
    src: 'https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=1200&q=80',
    alt: 'Elena & Co. wedding photography',
  },
  social: [
    { label: 'Instagram', href: 'https://instagram.com/example' },
    { label: 'Pinterest', href: 'https://pinterest.com/example' },
    { label: 'Facebook', href: 'https://facebook.com/example' },
  ],
  credit: { label: 'Noel Dario Andres', href: 'mailto:info@noel.marketing' },
} as const;

/** Navegación principal (header, menú móvil, footer y llms.txt). */
export const NAV = [
  { label: 'Work', href: '/portfolio', description: 'Work page' },
  { label: 'About', href: '/about', description: 'About page' },
  { label: 'Services', href: '/services', description: 'Services page' },
  { label: 'Journal', href: '/blog', description: 'Journal page' },
  { label: 'Contact', href: '/contact', description: 'Contact page' },
] as const;

/** Llamado a la acción principal, repetido en header, hero y CTA. */
export const PRIMARY_CTA = { label: 'Check Availability', href: '/contact' } as const;

/** `tel:` sin espacios (el href del original: "tel:+1(555)010-2040"). */
export const telHref = (phone: string) => `tel:${phone.replace(/\s/g, '')}`;
