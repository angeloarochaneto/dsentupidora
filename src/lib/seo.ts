export function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

export function buildTitle(keyword: string, city: string, differentiator: string): string {
  const title = `${capitalize(keyword)} ${city} | ${differentiator}`;
  return title.length <= 60 ? title : `${capitalize(keyword)} ${city} | 24h`;
}

export function buildDescription(keyword: string, city: string, phoneDisplay: string, extra: string): string {
  const lead = `${capitalize(keyword)} em ${city}: ${extra}`.slice(0, 70);
  const full = `${lead} Ligue ${phoneDisplay}.`;
  return full.length <= 155 ? full : `${lead.slice(0, 130)} Ligue ${phoneDisplay}.`.slice(0, 155);
}

export interface BreadcrumbItem {
  name: string;
  url: string;
}

export function buildBreadcrumbSchema(items: BreadcrumbItem[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
    })),
  };
}

export interface PlumberSchemaInput {
  partnerName: string;
  phoneDisplay: string;
  address: string;
  city: string;
  uf: string;
  url: string;
}

export function buildPlumberSchema(input: PlumberSchemaInput) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Plumber',
    name: input.partnerName,
    telephone: input.phoneDisplay,
    areaServed: `${input.city}, ${input.uf}`,
    address: {
      '@type': 'PostalAddress',
      streetAddress: input.address,
      addressLocality: input.city,
      addressRegion: input.uf,
      addressCountry: 'BR',
    },
    url: input.url,
  };
}
