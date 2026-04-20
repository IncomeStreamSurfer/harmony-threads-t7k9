import Stripe from "stripe";

const key = import.meta.env.STRIPE_SECRET_KEY as string;

export function stripe(): Stripe {
  return new Stripe(key, { apiVersion: "2025-02-24.acacia" as any });
}

export function formatGBP(pence: number): string {
  return "£" + (pence / 100).toFixed(2);
}
