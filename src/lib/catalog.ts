import type { DbProduct, DbVariant } from "./supabase";
import { listProducts, getProductBySlug } from "./supabase";

export type ProductWithVariants = DbProduct & { variants: DbVariant[] };

export function minPricePence(p: ProductWithVariants): number {
  const prices = p.variants.map((v) => v.price_pence ?? p.price_pence);
  return prices.length ? Math.min(...prices) : p.price_pence;
}

export function formatGBP(pence: number): string { return "£" + (pence / 100).toFixed(2); }

export function variantLabel(v: DbVariant): string { return [v.size, v.color].filter(Boolean).join(" / "); }

export async function allProducts() { return (await listProducts()) as ProductWithVariants[]; }
export async function productsInCollection(slug: string) { return (await allProducts()).filter((p) => p.collections.includes(slug)); }
export async function productBySlug(slug: string) { return (await getProductBySlug(slug)) as ProductWithVariants | null; }

export const COLLECTIONS = [
  { slug: "apparel", name: "Apparel", tagline: "Wear the music.",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?auto=format&fit=crop&w=1200&q=80",
    blurb: "Hand-printed heavyweight cotton tees and outerwear. Made in small runs, built to age into your favourite thing in the wardrobe.",
    keyword: "music graphic apparel" },
  { slug: "books", name: "Books & Audio", tagline: "Read the history.",
    image: "https://images.unsplash.com/photo-1526406915894-7bcd65f60845?auto=format&fit=crop&w=1200&q=80",
    blurb: "Deep-dive music books and audiobooks, written by journalists with access you won't find on a Wikipedia page. Instant digital delivery.",
    keyword: "music history books" },
  { slug: "fragrance", name: "Fragrance", tagline: "Smell the shop.",
    image: "https://images.unsplash.com/photo-1541643600914-78b084683601?auto=format&fit=crop&w=1200&q=80",
    blurb: "Small-batch unisex perfume made with a master perfumer in Grasse. Bottled by hand, numbered by batch.",
    keyword: "small batch unisex perfume" },
] as const;

export type CollectionSlug = (typeof COLLECTIONS)[number]["slug"];
