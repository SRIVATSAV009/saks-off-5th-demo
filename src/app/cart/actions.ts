"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserIdOrRedirect } from "@/lib/session";
import { getOrCreateCart } from "@/lib/cart";
import { isPromotionActive } from "@/lib/pricing";

export async function updateCartItemQuantity(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/cart");
  const itemId = String(formData.get("itemId"));
  const quantity = Math.max(1, Math.min(10, Number(formData.get("quantity")) || 1));

  const cart = await getOrCreateCart(userId);
  await db.cartItem.updateMany({
    where: { id: itemId, cartId: cart.id },
    data: { quantity },
  });

  revalidatePath("/cart");
}

export async function removeCartItem(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/cart");
  const itemId = String(formData.get("itemId"));

  const cart = await getOrCreateCart(userId);
  await db.cartItem.deleteMany({ where: { id: itemId, cartId: cart.id } });

  revalidatePath("/cart");
  revalidatePath("/", "layout");
}

export async function applyPromoCode(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/cart");
  const codeRaw = String(formData.get("code") ?? "").trim().toUpperCase();

  const cart = await getOrCreateCart(userId);

  if (!codeRaw) {
    await db.cart.update({ where: { id: cart.id }, data: { promoCode: null } });
    revalidatePath("/cart");
    return;
  }

  const promotion = await db.promotion.findUnique({ where: { code: codeRaw } });
  if (!promotion || !isPromotionActive(promotion)) {
    redirect("/cart?promoError=1");
  }

  await db.cart.update({ where: { id: cart.id }, data: { promoCode: codeRaw } });
  revalidatePath("/cart");
  redirect("/cart?promoApplied=1");
}

export async function removePromoCode() {
  const userId = await requireUserIdOrRedirect("/cart");
  const cart = await getOrCreateCart(userId);
  await db.cart.update({ where: { id: cart.id }, data: { promoCode: null } });
  revalidatePath("/cart");
}
