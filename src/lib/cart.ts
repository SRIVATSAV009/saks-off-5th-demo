import { db } from "@/lib/db";

export async function getOrCreateCart(userId: string) {
  const existing = await db.cart.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.cart.create({ data: { userId } });
}

export async function getOrCreateWishlist(userId: string) {
  const existing = await db.wishlist.findUnique({ where: { userId } });
  if (existing) return existing;
  return db.wishlist.create({ data: { userId } });
}
