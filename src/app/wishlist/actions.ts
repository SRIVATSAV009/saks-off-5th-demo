"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserIdOrRedirect } from "@/lib/session";
import { getOrCreateCart, getOrCreateWishlist } from "@/lib/cart";
import { toProductView } from "@/lib/product";

export async function removeFromWishlist(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/wishlist");
  const itemId = String(formData.get("itemId"));

  const wishlist = await getOrCreateWishlist(userId);
  await db.wishlistItem.deleteMany({ where: { id: itemId, wishlistId: wishlist.id } });

  revalidatePath("/wishlist");
  revalidatePath("/", "layout");
}

// Moves an item to the cart using the product's first listed color/size —
// a reasonable default for a one-click "move to bag" action, since the
// wishlist doesn't track variant selection.
export async function moveToCart(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/wishlist");
  const itemId = String(formData.get("itemId"));
  const productId = String(formData.get("productId"));

  const [wishlist, cart, product] = await Promise.all([
    getOrCreateWishlist(userId),
    getOrCreateCart(userId),
    db.product.findUnique({ where: { id: productId } }),
  ]);
  if (!product) return;

  const view = toProductView(product);
  const color = view.colorList[0] ?? "One Color";
  const size = view.sizeList[0] ?? "One Size";

  const existing = await db.cartItem.findFirst({
    where: { cartId: cart.id, productId, color, size },
  });
  if (existing) {
    await db.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + 1 } });
  } else {
    await db.cartItem.create({ data: { cartId: cart.id, productId, color, size, quantity: 1 } });
  }

  await db.wishlistItem.deleteMany({ where: { id: itemId, wishlistId: wishlist.id } });

  revalidatePath("/wishlist");
  revalidatePath("/cart");
  revalidatePath("/", "layout");
  redirect("/wishlist?moved=1");
}
