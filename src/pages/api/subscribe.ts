import type { APIRoute } from "astro";
import { supaAdmin } from "../../lib/supabase";
import { sendEmail } from "../../lib/email";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  let email: string | null = null;
  const ct = request.headers.get("content-type") || "";
  if (ct.includes("application/json")) {
    const body = await request.json();
    email = body.email;
  } else {
    const form = await request.formData();
    email = (form.get("email") as string) || null;
  }
  if (!email) return new Response(JSON.stringify({ error: "email required" }), { status: 400 });

  await supaAdmin().from("subscribers").upsert({ email, source: "footer" }, { onConflict: "email" });

  await sendEmail({
    to: email,
    subject: "Welcome to Harmony Threads",
    html: `<div style="font-family:Georgia,serif;max-width:520px;margin:0 auto;padding:32px">
      <h1 style="font-size:28px;color:#0a0a0a">Welcome.</h1>
      <p style="color:#555;line-height:1.6">You're on the list. Expect a note from us when the next drop is ready or when we have something worth reading. No spam, ever. — Harmony Threads</p>
    </div>`,
  });

  if (ct.includes("application/json")) {
    return new Response(JSON.stringify({ ok: true }), { status: 200 });
  }
  return redirect("/?subscribed=1");
};
