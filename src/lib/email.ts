const KEY = import.meta.env.RESEND_API_KEY as string;
const FROM = "Harmony Threads <onboarding@resend.dev>";

export async function sendEmail(opts: { to: string; subject: string; html: string; reply_to?: string }) {
  if (!KEY) {
    console.warn("RESEND_API_KEY not set — skipping email");
    return { skipped: true } as const;
  }
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from: FROM, to: opts.to, subject: opts.subject, html: opts.html, reply_to: opts.reply_to }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error("resend error", res.status, text);
    return { error: text } as const;
  }
  return (await res.json()) as { id: string };
}

export function orderConfirmationEmail(args: {
  email: string;
  amountTotal: number;
  currency: string;
  items: Array<{ name: string; qty: number; price: number; variant?: string }>;
  shipping?: { name?: string; address?: Record<string, string | null> };
}) {
  const money = (n: number) => (args.currency === "gbp" ? "£" : "$") + (n / 100).toFixed(2);
  const rows = args.items
    .map(
      (i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:1px solid #eee">
          <div style="font-weight:600">${i.name}</div>
          ${i.variant ? `<div style="color:#666;font-size:13px">${i.variant}</div>` : ""}
        </td>
        <td style="padding:10px 0;border-bottom:1px solid #eee;text-align:right">${i.qty} × ${money(i.price)}</td>
      </tr>`
    )
    .join("");
  const ship = args.shipping?.address
    ? `<p style="color:#444;margin:20px 0 0">Shipping to: ${Object.values(args.shipping.address).filter(Boolean).join(", ")}</p>`
    : "";
  return `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;max-width:560px;margin:0 auto;padding:32px;background:#fafaf7">
    <h1 style="font-family:Georgia,serif;font-size:28px;color:#0a0a0a;margin:0 0 8px">Thank you — order confirmed.</h1>
    <p style="color:#555;margin:0 0 24px">We've received your order and will get it ready to ship.</p>
    <table style="width:100%;border-collapse:collapse;font-size:14px">${rows}
      <tr><td style="padding:14px 0 0;font-weight:700">Total</td><td style="padding:14px 0 0;text-align:right;font-weight:700">${money(args.amountTotal)}</td></tr>
    </table>
    ${ship}
    <p style="margin:32px 0 0;color:#666;font-size:13px">Questions? Reply to this email and a human will get back to you within a day.</p>
    <p style="margin:6px 0 0;color:#c2410c;font-weight:600">— The Harmony Threads team</p>
  </div>`;
}
