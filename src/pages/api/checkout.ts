import type { APIRoute } from "astro";
import { stripe } from "../../lib/stripe";
import { supaPublic } from "../../lib/supabase";

export const prerender = false;

export const POST: APIRoute = async ({ request }) => {
  try {
    const body = await request.json();
    const items = (body.items ?? []) as Array<{ sku: string; qty: number }>;
    if (!items.length) return new Response(JSON.stringify({ error: "empty cart" }), { status: 400 });

    const sb = supaPublic();
    const skus = items.map((i) => i.sku);
    const { data: variants, error } = await sb.from("product_variants").select("*").in("sku", skus);
    if (error || !variants) return new Response(JSON.stringify({ error: "variant lookup failed" }), { status: 500 });

    const { data: products } = await sb.from("products").select("*").in("id", Array.from(new Set(variants.map((v: any) => v.product_id))));

    const origin = import.meta.env.PUBLIC_SITE_URL || `${request.headers.get("x-forwarded-proto") ?? "https"}://${request.headers.get("x-forwarded-host") ?? request.headers.get("host")}`;

    const line_items: any[] = [];
    let requiresShipping = false;
    for (const it of items) {
      const v = variants.find((x: any) => x.sku === it.sku);
      if (!v) continue;
      const p = products?.find((x: any) => x.id === v.product_id);
      if (!p) continue;
      const price = v.price_pence ?? p.price_pence;
      const needsShipping = p.type !== "eBook";
      if (needsShipping) requiresShipping = true;
      const name = [p.name, [v.size, v.color].filter(Boolean).join(" / ")].filter(Boolean).join(" — ");
      line_items.push({
        quantity: it.qty,
        price_data: {
          currency: (p.currency || "gbp").toLowerCase(),
          unit_amount: price,
          product_data: {
            name,
            description: p.tagline || undefined,
            images: p.image_url ? [p.image_url] : undefined,
            metadata: { sku: v.sku, product_id: p.id, slug: p.slug },
          },
        },
      });
    }

    if (!line_items.length) return new Response(JSON.stringify({ error: "no valid items" }), { status: 400 });

    const session = await stripe().checkout.sessions.create({
      mode: "payment",
      line_items,
      customer_creation: "always",
      ...(requiresShipping
        ? {
            shipping_address_collection: { allowed_countries: ["GB", "IE", "FR", "DE", "NL", "ES", "IT", "BE", "US", "CA", "AU"] },
            shipping_options: [
              { shipping_rate_data: { display_name: "Standard UK (2–4 days)", type: "fixed_amount", fixed_amount: { amount: 495, currency: "gbp" } } },
              { shipping_rate_data: { display_name: "Free over £50", type: "fixed_amount", fixed_amount: { amount: 0, currency: "gbp" } } },
            ],
          }
        : {}),
      success_url: `${origin}/order/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/cart`,
      metadata: { items_json: JSON.stringify(items) },
    });

    return new Response(JSON.stringify({ url: session.url }), { status: 200, headers: { "Content-Type": "application/json" } });
  } catch (e: any) {
    console.error("checkout error", e);
    return new Response(JSON.stringify({ error: e.message || "checkout failed" }), { status: 500 });
  }
};
