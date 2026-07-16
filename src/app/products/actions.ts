"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { getCurrentUserId } from "@/lib/session";
import { getOrCreateCart, getOrCreateWishlist } from "@/lib/cart";

export async function addToCart(formData: FormData) {
  const slug = String(formData.get("slug"));
  const productId = String(formData.get("productId"));
  const color = String(formData.get("color"));
  const size = String(formData.get("size"));
  const quantity = Math.max(1, Number(formData.get("quantity")) || 1);

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/login?next=/products/${slug}`);
  }

  const cart = await getOrCreateCart(userId);
  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId, color, size },
  });

  if (existing) {
    await db.cartItem.update({
      where: { id: existing.id },
      data: { quantity: existing.quantity + quantity },
    });
  } else {
    await db.cartItem.create({
      data: { cartId: cart.id, productId, color, size, quantity },
    });
  }

  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect(`/products/${slug}?added=1`);
}

export async function addToWishlist(formData: FormData) {
  const slug = String(formData.get("slug"));
  const productId = String(formData.get("productId"));

  const userId = await getCurrentUserId();
  if (!userId) {
    redirect(`/login?next=/products/${slug}`);
  }

  const wishlist = await getOrCreateWishlist(userId);
  const existing = await db.wishlistItem.findFirst({
    where: { wishlistId: wishlist.id, productId },
  });

  if (!existing) {
    await db.wishlistItem.create({ data: { wishlistId: wishlist.id, productId } });
  }

  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
  redirect(`/products/${slug}?wishlisted=1`);
}
