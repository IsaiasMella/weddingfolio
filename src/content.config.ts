/**
 * Content Collections: el "CMS en archivos" del sitio.
 *
 * Cada colección declara DÓNDE está su contenido (loader) y QUÉ FORMA tiene
 * (esquema zod). Astro valida cada archivo en el build: si a una boda le falta
 * la fecha o una URL de foto está mal escrita, el build falla con un mensaje
 * claro en vez de publicar una página rota. Además genera los tipos de
 * TypeScript, así `entry.data.location` se autocompleta en los componentes.
 *
 * En Next el equivalente sería Contentlayer/Velite, o un CMS headless + tipos.
 */
import { defineCollection } from 'astro:content';
import { file, glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Foto remota (Unsplash). Se guarda la URL, no el archivo: astro:assets la
 * descarga y optimiza en el build, igual que en el sitio original.
 * Para usar fotos propias locales, ver docs/COMO-USAR-DE-BASE.md.
 */
const photo = z.object({
  src: z.url(),
  alt: z.string().min(1, 'Toda foto necesita texto alternativo'),
});

/** Bodas del portfolio: src/content/portfolio/<slug>.md */
const portfolio = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/portfolio' }),
  schema: z.object({
    /** Nombres de la pareja: "Maya & Jordan". */
    couple: z.string(),
    /** Título largo usado en tarjetas y en el detalle: "Maya & Jordan — Sonoma Garden Wedding". */
    title: z.string(),
    location: z.string(),
    date: z.coerce.date(),
    /** Frase introductoria (bajada y meta description). */
    excerpt: z.string(),
    cover: photo,
    gallery: z.array(photo).min(1),
    /** Aparece en "Selected work" de la home. */
    featured: z.boolean().default(false),
  }),
});

/** Artículos del journal: src/content/blog/<slug>.md */
const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    author: z.string().default('Elena Moreau'),
    cover: photo,
    tags: z.array(z.string()).default([]),
    draft: z.boolean().default(false),
  }),
});

/** Paquetes de precios (home y services): src/content/packages.yaml */
const packages = defineCollection({
  loader: file('src/content/packages.yaml'),
  schema: z.object({
    name: z.string(),
    price: z.string(),
    description: z.string(),
    features: z.array(z.string()).min(1),
    /** Resalta la tarjeta (borde dorado, fondo más oscuro y etiqueta). */
    highlight: z.string().optional(),
    order: z.number(),
  }),
});

/** Testimonios (home): src/content/testimonials.yaml */
const testimonials = defineCollection({
  loader: file('src/content/testimonials.yaml'),
  schema: z.object({
    quote: z.string(),
    couple: z.string(),
    location: z.string(),
    order: z.number(),
  }),
});

/** Preguntas frecuentes (home y services): src/content/faq.yaml */
const faq = defineCollection({
  loader: file('src/content/faq.yaml'),
  schema: z.object({
    question: z.string(),
    answer: z.string(),
    order: z.number(),
  }),
});

/** Pasos del proceso (home y services): src/content/process.yaml */
const process = defineCollection({
  loader: file('src/content/process.yaml'),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    order: z.number(),
  }),
});

export const collections = { portfolio, blog, packages, testimonials, faq, process };
