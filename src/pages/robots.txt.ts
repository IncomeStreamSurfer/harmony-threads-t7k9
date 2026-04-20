import type { APIRoute } from "astro";

const SITE = process.env.PUBLIC_SITE_URL || "https://harmony-threads-t7k9.vercel.app";

export const GET: APIRoute = () => {
  const body = `User-agent: *\nAllow: /\nDisallow: /api/\nDisallow: /cart\nDisallow: /order/\n\nSitemap: ${SITE}/sitemap-index.xml\n`;
  return new Response(body, { headers: { "Content-Type": "text/plain" } });
};
