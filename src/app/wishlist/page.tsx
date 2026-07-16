import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/session";
import { getOrCreateWishlist } from "@/lib/cart";
import { db } from "@/lib/db";
import { toProductView } from "@/lib/product";
import Money from "@/components/Money";
import { removeFromWishlist, moveToCart } from "@/app/wishlist/actions";

export default async function WishlistPage({
  searchParams,
}: {
  searchParams: Promise<{ moved?: string }>;
}) {
  const { moved } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Wishlist</h1>
        <p className="text-(--color-muted) mb-6">Sign in to view your wishlist.</p>
        <Link href="/login?next=/wishlist" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const wishlist = await getOrCreateWishlist(user.id);
  const items = await db.wishlistItem.findMany({
    where: { wishlistId: wishlist.id },
    include: { product: true },
    orderBy: { addedAt: "desc" },
  });

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl mb-8">Your Wishlist</h1>

      {moved === "1" && (
        <p className="toast-success mb-6 px-4 py-2 text-sm">
          Moved to your bag. <Link href="/cart" className="underline">View bag</Link>
        </p>
      )}

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-(--color-muted) mb-6">Your wishlist is empty.</p>
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-10">
          {items.map((item) => {
            const view = toProductView(item.product);
            return (
              <div key={item.id}>
                <Link href={`/products/${item.product.slug}`} className="block">
                  <div className="relative aspect-[7/9] bg-(--color-paper-alt)">
                    <Image
                      src={view.imageList[0]}
                      alt={item.product.name}
                      fill
                      sizes="(max-width: 768px) 50vw, 25vw"
                      className="object-cover"
                    />
                  </div>
                </Link>
                <div className="pt-3 text-sm">
                  <p className="eyebrow">{item.product.brand}</p>
                  <p>{item.product.name}</p>
                  <p className="mt-1">
                    <Money amount={view.effectivePrice} />
                  </p>
                  <div className="flex gap-3 mt-3">
                    <form action={moveToCart}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <input type="hidden" name="productId" value={item.productId} />
                      <button type="submit" className="btn btn-outline btn-sm">Move to Bag</button>
                    </form>
                    <form action={removeFromWishlist}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="link-quiet text-xs underline">Remove</button>
                    </form>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
