import type { Promotion } from "@/generated/prisma/client";

export type PricedLine = {
  lineTotal: number;
};

export const SHIPPING_METHODS = {
  standard: { label: "Standard Shipping (5-7 business days)", cost: 9.95 },
  express: { label: "Express Shipping (2-3 business days)", cost: 24.95 },
} as const;

export type ShippingMethodKey = keyof typeof SHIPPING_METHODS;

const TAX_RATE = 0.08875; // demo NY sales tax rate

export function isPromotionActive(promotion: Promotion): boolean {
  const now = new Date();
  return promotion.enabled && promotion.startDate <= now && promotion.endDate >= now;
}

export function computeTotals(
  lines: PricedLine[],
  promotion: Promotion | null,
  shippingMethod: ShippingMethodKey = "standard"
) {
  const subtotal = round2(lines.reduce((sum, l) => sum + l.lineTotal, 0));

  let discount = 0;
  let shipping = subtotal > 0 ? SHIPPING_METHODS[shippingMethod].cost : 0;

  if (promotion && isPromotionActive(promotion)) {
    if (promotion.discountType === "percent") {
      discount = subtotal * (promotion.discountValue / 100);
    } else if (promotion.discountType === "fixed") {
      discount = Math.min(promotion.discountValue, subtotal);
    } else if (promotion.discountType === "free_shipping") {
      shipping = 0;
    }
  }
  discount = round2(discount);

  const taxable = Math.max(subtotal - discount, 0);
  const tax = round2(taxable * TAX_RATE);
  const total = round2(taxable + shipping + tax);

  return { subtotal, discount, shipping: round2(shipping), tax, total };
}

function round2(n: number) {
  return Math.round(n * 100) / 100;
}
