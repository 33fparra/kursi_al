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

export const collections = { ditari };
