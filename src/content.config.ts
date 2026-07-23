import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const cities = defineCollection({
  loader: glob({ pattern: '**/*.json', base: './src/content/cities' }),
  schema: z.object({
    city: z.string(),
    uf: z.string(),
    slugCity: z.string(),
    slugUf: z.string(),
    keyword: z.string(),
    brand: z.object({
      name: z.string(),
      logoUrl: z.string(),
    }),
    phone: z.object({
      display: z.string(),
      tel: z.string(),
    }),
    whatsapp: z.object({
      number: z.string(),
      message: z.string(),
    }),
    conversionMode: z.enum(['leadster', 'partner-whatsapp']),
    leadsterEmbedId: z.string(),
    heroImage: z
      .object({
        url: z.string(),
        alt: z.string(),
      })
      .optional(),
    kpis: z
      .array(
        z.object({
          num: z.string(),
          lbl: z.string(),
        }),
      )
      .length(4),
    services: z.array(
      z.object({
        nome: z.string(),
        desc: z.string(),
        preco: z.string(),
        img: z.string(),
      }),
    ),
    differentials: z
      .array(
        z.object({
          titulo: z.string(),
          desc: z.string(),
        }),
      )
      .length(6),
    areas: z.array(
      z.object({
        bairro: z.string(),
        tempo: z.string(),
        slug: z.string(),
        desc: z.string(),
      }),
    ),
    otherNeighborhoods: z.array(z.string()).min(5),
    testimonials: z.array(
      z.object({
        texto: z.string(),
        nome: z.string(),
        bairro: z.string(),
      }),
    ),
    partner: z.object({
      name: z.string(),
      address: z.string(),
      mapEmbedUrl: z.string(),
    }),
  }),
});

export const collections = { cities };
