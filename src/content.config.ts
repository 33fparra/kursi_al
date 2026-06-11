import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const ditari = defineCollection({
  loader: glob({ pattern: ['**/*.md', '!README.md'], base: './src/content/ditari' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    type: z.enum(['edukim', 'lajme']),
    category: z.string(),
    date: z.coerce.date(),
    image: z.string(),
    imageAlt: z.string(),
    readMinutes: z.number(),
    lang: z.enum(['sq', 'en']),
  }),
});

export const collections = { ditari };
