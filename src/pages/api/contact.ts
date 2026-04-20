import type { APIRoute } from "astro";
import { supaAdmin } from "../../lib/supabase";
import { sendEmail } from "../../lib/email";
import { BRAND } from "../../lib/brand";

export const prerender = false;

export const POST: APIRoute = async ({ request, redirect }) => {
  const form = await request.formData();
  const name = (form.get("name") as string) || "";
  const email = (form.get("email") as string) || "";
  const message = (form.get("message") as string) || "";
  if (!email || !message) return new Response("missing fields", { status: 400 });

  await supaAdmin().from("contact_messages").insert({ name, email, message });

  await sendEmail({
    to: BRAND.email,
    subject: `New contact from ${name || email}`,
    html: `<p><strong>From:</strong> ${name} (${email})</p><p>${message.replace(/\n/g, "<br/>")}</p>`,
    reply_to: email,
  });
  await sendEmail({
    to: email,
    subject: "Thanks — we got your note",
    html: `<div style="font-family:Georgia,serif;max-width:520px;padding:32px"><h1>Got it, thanks.</h1><p>We'll be back to you within a working day. — Harmony Threads</p></div>`,
  });

  return redirect("/contact?sent=1");
};
