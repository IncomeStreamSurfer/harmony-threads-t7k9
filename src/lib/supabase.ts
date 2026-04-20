import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.PUBLIC_SUPABASE_URL as string;
const anon = import.meta.env.PUBLIC_SUPABASE_ANON_KEY as string;
const service = (import.meta.env.SUPABASE_SERVICE_ROLE as string) || anon;

export function supaPublic(): SupabaseClient {
  return createClient(url, anon, { auth: { persistSession: false } });
}

export function supaAdmin(): SupabaseClient {
  return createClient(url, service, { auth: { persistSession: false } });
}

export type DbProduct = {
  id: string; slug: string; name: string; tagline: string | null; vendor: string | null;
  type: string | null; description: string | null; long_description: string[] | null;
  highlights: string[] | null; price_pence: number; compare_at_pence: number | null;
  currency: string; image_url: string | null; image_alt: string | null;
  gallery: string[]; collections: string[]; tags: string[];
  seo_title: string | null; seo_description: string | null;
  weight_g: number | null; shipping_note: string | null; care: string[];
};

export type DbVariant = {
  sku: string; product_id: string; size: string | null; color: string | null;
  inventory: number; barcode: string | null;
  price_pence: number | null; compare_at_pence: number | null; image_url: string | null;
};

export async function listProducts() {
  const sb = supaPublic();
  const { data: products } = await sb.from("products").select("*").order("created_at", { ascending: true });
  const { data: variants } = await sb.from("product_variants").select("*");
  return ((products as DbProduct[]) ?? []).map((p) => ({ ...p, variants: ((variants as DbVariant[]) ?? []).filter((v) => v.product_id === p.id) }));
}

export async function getProductBySlug(slug: string) {
  const sb = supaPublic();
  const { data } = await sb.from("products").select("*").eq("slug", slug).maybeSingle();
  if (!data) return null;
  const { data: variants } = await sb.from("product_variants").select("*").eq("product_id", (data as DbProduct).id);
  return { ...(data as DbProduct), variants: (variants as DbVariant[]) ?? [] };
}

export async function listPublishedPosts() {
  const sb = supaPublic();
  const { data } = await sb.from("content").select("slug,title,excerpt,published_at,cover_image_url,tags,seo_description").not("published_at", "is", null).order("published_at", { ascending: false });
  return data ?? [];
}

export async function getPostBySlug(slug: string) {
  const sb = supaPublic();
  const { data } = await sb.from("content").select("*").eq("slug", slug).not("published_at", "is", null).maybeSingle();
  return data;
}
