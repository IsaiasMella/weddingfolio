/**
 * /rss.xml — feed RSS del journal (route handler, como app/rss.xml/route.ts
 * en Next). @astrojs/rss arma el XML; acá solo se eligen los datos.
 * Los enlaces relativos se completan con `site` de astro.config.mjs.
 */
import rss from '@astrojs/rss';
import type { APIRoute } from 'astro';
import { SITE } from '@/data/site';
import { getPosts } from '@/lib/content';

export const GET: APIRoute = async (context) => {
  const posts = await getPosts();
  return rss({
    title: `${SITE.name} Journal`,
    description: SITE.description,
    site: context.site ?? SITE.url,
    items: posts.map((post) => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.pubDate,
      link: `/blog/${post.id}/`,
    })),
    customData: '<language>en-us</language>',
  });
};
