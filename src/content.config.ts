import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ditari = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/ditari' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['edukim', 'lajme', 'tech', 'ai', 'int']),
    category: z.string(),
    author: z.string().optional(),
    coAuthor: z.string().optional(),
    country: z.string().optional(),
    date: z.coerce.date(),
    translationKey: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    readMinutes: z.number().int().positive(),
    lang: z.enum(['sq', 'en']),
  }),
});

const historiEkonomi = defineCollection({
  // Files or folders prefixed with "_" (e.g. _examples/, _shembull-kapitulli.md)
  // are drafts/examples and are excluded from the collection — they never
  // appear on the live site, even if one of the two prefixes is later removed.
  loader: glob({ pattern: ['**/*.md', '!README.md', '!**/_*.md', '!**/_*/**'], base: './src/content/histori-ekonomi' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum([
      'para-ilire',
      'iliret',
      'mesjeta',
      'skenderbeu',
      'pushtimi-otoman',
      'pavaresia',
      'komunizmi',
      'postkomunizmi',
    ]),
    category: z.string(),
    author: z.string().optional(),
    coAuthor: z.string().optional(),
    country: z.string().optional(),
    date: z.coerce.date(),
    translationKey: z.string(),
    image: z.string(),
    imageAlt: z.string(),
    readMinutes: z.number().int().positive(),
    lang: z.enum(['sq', 'en']),
    // Chapter order within the block — narrative sequence, not a blog feed.
    // Falls back to `date` ascending when omitted.
    order: z.number().int().nonnegative().optional(),
  }),
});

export const collections = { ditari, historiEkonomi };
