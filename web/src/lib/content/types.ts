export type CategoryId = 'peliculas' | 'series' | 'anime' | 'gaming' | 'tecnologia';

export interface ArticleSnapshot {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  bodyHtml: string;
  coverImage: string | null;
  ogImage: string | null;
  category: { id: CategoryId; name: string };
  author: { name: string; slug: string };
  tags: { slug: string; name: string }[];
  featured: boolean;
  trending: boolean;
  readMinutes: number;
  metaDescription: string | null;
  metaKeywords: string | null;
  canonicalUrl: string | null;
  noIndex: boolean;
  publishedAt: string;
  modifiedAt: string | null;
}

export interface ContentSnapshot {
  generatedAt: string;
  sourceCommit: string | null;
  categories: { id: CategoryId; name: string; sortOrder: number }[];
  articles: ArticleSnapshot[];
}

export const CATEGORIES: ContentSnapshot['categories'] = [
  { id: 'peliculas', name: 'Películas', sortOrder: 1 },
  { id: 'series', name: 'Series', sortOrder: 2 },
  { id: 'anime', name: 'Anime', sortOrder: 3 },
  { id: 'gaming', name: 'Videojuegos', sortOrder: 4 },
  { id: 'tecnologia', name: 'Tecnología', sortOrder: 5 },
];
