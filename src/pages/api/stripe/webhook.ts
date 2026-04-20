import type { APIRoute } from "astro";
import { stripe } from "../../../lib/stripe";
import { supaAdmin } from "../../../lib/supabase";
import { sendEmail, orderConfirmationEmail } from "../../../lib/email";

export const prerender = false;

const WEBHOOK_SECRET = import.meta.env.STRIPE_WEBHOOK_SECRET as string;

export const POST: APIRoute = async ({ request }) => {
  const sig = request.headers.get("stripe-signature");
  if (!sig || !WEBHOOK_SECRET) return new Response("missing signature", { status: 400 });

  const raw = await request.text();
  let event;
  try {
    event = stripe().webhooks.constructEvent(raw, sig, WEBHOOK_SECRET);
  } catch (e: any) {
    console.error("webhook verify failed", e.message);
    return new Response(`webhook verify failed: ${e.message}`, { status: 400 });
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as any;
    const email = session.customer_details?.email ?? session.customer_email ?? null;
    const amountTotal = session.amount_total;
    const currency = session.currency;

    try {
      const full = await stripe().checkout.sessions.retrieve(session.id, { expand: ["line_items", "line_items.data.price.product"] });
      const items = (full.line_items?.data ?? []).map((li: any) => ({
        name: li.description || li.price?.product?.name,
        qty: li.quantity,
        price: li.price?.unit_amount ?? 0,
        variant: undefined,
      }));

      await supaAdmin().from("orders").upsert(
        {
          stripe_session_id: session.id,
          email,
          amount_total: amountTotal,
          currency,
          status: "paid",
          items,
          shipping: session.shipping_details ?? null,
        },
        { onConflict: "stripe_session_id" }
      );

      if (email) {
        await sendEmail({
          to: email,
          subject: "Your Harmony Threads order is confirmed",
          html: orderConfirmationEmail({ email, amountTotal, currency, items, shipping: session.shipping_details }),
        });
      }
    } catch (e) {
      console.error("fulfilment error", e);
    }
  }

  return new Response(JSON.stringify({ received: true }), { status: 200, headers: { "Content-Type": "application/json" } });
};
