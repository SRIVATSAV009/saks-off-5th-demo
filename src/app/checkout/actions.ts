"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserIdOrRedirect } from "@/lib/session";
import { getOrCreateCart } from "@/lib/cart";
import { toProductView } from "@/lib/product";
import { computeTotals, isPromotionActive, type ShippingMethodKey } from "@/lib/pricing";
import { verifyRecaptcha } from "@/lib/recaptcha";

function generateOrderNumber(): string {
  return `SAKS${Date.now().toString(36).toUpperCase()}`;
}

export async function placeOrder(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/checkout");

  const recaptchaToken = String(formData.get("g-recaptcha-response") ?? "");
  const captchaOk = await verifyRecaptcha(recaptchaToken);
  if (!captchaOk) {
    redirect("/checkout?error=captcha");
  }

  const cart = await getOrCreateCart(userId);
  const cartItems = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });
  if (cartItems.length === 0) {
    redirect("/cart");
  }

  // Resolve shipping address: either an existing saved address, or a new
  // one entered inline (which is also saved to the account for next time).
  const addressId = String(formData.get("addressId") ?? "");
  let shipLine1: string, shipLine2: string, shipCity: string, shipState: string, shipZip: string;

  if (addressId && addressId !== "new") {
    const addr = await db.address.findFirst({ where: { id: addressId, userId } });
    if (!addr) {
      redirect("/checkout?error=address");
    }
    shipLine1 = addr.line1;
    shipLine2 = addr.line2 ?? "";
    shipCity = addr.city;
    shipState = addr.state;
    shipZip = addr.zip;
  } else {
    shipLine1 = String(formData.get("line1") ?? "").trim();
    shipLine2 = String(formData.get("line2") ?? "").trim();
    shipCity = String(formData.get("city") ?? "").trim();
    shipState = String(formData.get("state") ?? "").trim();
    shipZip = String(formData.get("zip") ?? "").trim();

    if (!shipLine1 || !shipCity || !shipState || !shipZip) {
      redirect("/checkout?error=address");
    }

    const existingCount = await db.address.count({ where: { userId } });
    await db.address.create({
      data: {
        userId,
        label: "Checkout Address",
        line1: shipLine1,
        line2: shipLine2 || null,
        city: shipCity,
        state: shipState,
        zip: shipZip,
        isDefault: existingCount === 0,
      },
    });
  }

  const shippingMethod = (formData.get("shippingMethod") === "express" ? "express" : "standard") as ShippingMethodKey;

  // Mock payment — no real processor is called. We only sanity-check the
  // fields look filled in, matching the scope of this demo.
  const cardNumber = String(formData.get("cardNumber") ?? "").replace(/\s+/g, "");
  const cardExpiry = String(formData.get("cardExpiry") ?? "");
  const cardCvv = String(formData.get("cardCvv") ?? "");
  if (cardNumber.length < 12 || !cardExpiry || cardCvv.length < 3) {
    redirect("/checkout?error=payment");
  }

  const promotion = cart.promoCode
    ? await db.promotion.findUnique({ where: { code: cart.promoCode } })
    : null;
  const promotionActive = promotion && isPromotionActive(promotion) ? promotion : null;

  const lines = cartItems.map((item) => {
    const view = toProductView(item.product);
    return {
      productId: item.productId,
      name: item.product.name,
      color: item.color,
      size: item.size,
      quantity: item.quantity,
      price: view.effectivePrice,
      lineTotal: view.effectivePrice * item.quantity,
    };
  });

  const totals = computeTotals(lines, promotionActive, shippingMethod);
  const orderNumber = generateOrderNumber();

  await db.$transaction(async (tx) => {
    await tx.order.create({
      data: {
        orderNumber,
        userId,
        status: "Placed",
        subtotal: totals.subtotal,
        discount: totals.discount,
        shipping: totals.shipping,
        tax: totals.tax,
        total: totals.total,
        promoCode: promotionActive?.code ?? null,
        shipLine1,
        shipLine2: shipLine2 || null,
        shipCity,
        shipState,
        shipZip,
        shipMethod: shippingMethod,
        items: {
          create: lines.map((l) => ({
            productId: l.productId,
            name: l.name,
            color: l.color,
            size: l.size,
            quantity: l.quantity,
            price: l.price,
          })),
        },
      },
    });

    await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
    await tx.cart.update({ where: { id: cart.id }, data: { promoCode: null } });
  });

  revalidatePath("/account/orders");
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect(`/checkout/confirmation/${orderNumber}`);
}
