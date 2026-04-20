# Harmony Threads

> Music, memories & things worth wearing.

Independent ecommerce site for hand-printed music apparel, deep-dive music books, and small-batch fragrance. Built on Astro + Supabase + Stripe + Resend, deployed on Vercel.

## What's in the box

- **3 product families** seeded into Supabase: "The Band" graphic tee (12 size/colour variants), The History of Rock Music eBook (PDF / Audiobook / Kindle), Eau de Vinyl 50ml fragrance.
- **Dynamic-pricing checkout** reads prices from Supabase and creates Stripe Checkout sessions on the fly.
- **Stripe webhook** at `/api/stripe/webhook` writes confirmed orders into Supabase and fires a Resend order-confirmation email.
- **Collections hubs** with long-form SEO copy and `CollectionPage` JSON-LD.
- **Journal** at `/blog` dynamically renders posts from the Supabase `content` table.
- **SEO**: `@astrojs/sitemap`, `robots.txt`, JSON-LD on every page, canonical URLs, Open Graph + Twitter cards.
- **Extras**: size guide, shipping & returns with FAQ schema, terms, privacy, contact form, newsletter signup.

## Stack

- Astro 5 (SSR, Vercel adapter)
- Tailwind v4 via `@tailwindcss/vite`
- Supabase (DB + RLS)
- Stripe Checkout + webhooks
- Resend (transactional email)

## Local development

```bash
npm install --legacy-peer-deps
cp .env.example .env  # fill in the real values
npm run dev
```

## Next steps

- Connect a custom domain in the Vercel dashboard.
- Verify your sending domain with Resend (currently using `onboarding@resend.dev`).
- Replace placeholder Unsplash imagery with real product photography.
- Swap Stripe test keys for live keys in Vercel env when you go live.
