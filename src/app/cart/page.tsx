import Link from "next/link";
import Image from "next/image";
import { getCurrentUser } from "@/lib/session";
import { getOrCreateCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { toProductView } from "@/lib/product";
import { computeTotals } from "@/lib/pricing";
import Money from "@/components/Money";
import {
  updateCartItemQuantity,
  removeCartItem,
  applyPromoCode,
  removePromoCode,
} from "@/app/cart/actions";

export default async function CartPage({
  searchParams,
}: {
  searchParams: Promise<{ promoError?: string; promoApplied?: string }>;
}) {
  const { promoError, promoApplied } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Your Bag</h1>
        <p className="text-(--color-muted) mb-6">Sign in to view your bag.</p>
        <Link href="/login?next=/cart" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const cart = await getOrCreateCart(user.id);
  const items = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
    orderBy: { id: "asc" },
  });

  const promotion = cart.promoCode
    ? await db.promotion.findUnique({ where: { code: cart.promoCode } })
    : null;

  const lines = items.map((item) => {
    const view = toProductView(item.product);
    return { item, view, lineTotal: view.effectivePrice * item.quantity };
  });

  const totals = computeTotals(
    lines.map((l) => ({ lineTotal: l.lineTotal })),
    promotion
  );

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl mb-8">Your Bag</h1>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-(--color-muted) mb-6">Your bag is empty.</p>
          <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-10">
          <div className="md:col-span-2 divide-y divide-(--color-line)">
            {lines.map(({ item, view, lineTotal }) => (
              <div key={item.id} className="py-6 flex gap-4">
                <Link href={`/products/${item.product.slug}`} className="relative w-24 aspect-[7/9] bg-(--color-paper-alt) shrink-0">
                  <Image src={view.imageList[0]} alt={item.product.name} fill sizes="100px" className="object-cover" />
                </Link>
                <div className="flex-1">
                  <p className="eyebrow">{item.product.brand}</p>
                  <Link href={`/products/${item.product.slug}`} className="text-sm hover:underline">
                    {item.product.name}
                  </Link>
                  <p className="text-sm text-(--color-muted) mt-1">
                    {item.color} / {item.size}
                  </p>
                  <p className="text-sm mt-1"><Money amount={view.effectivePrice} /></p>

                  <div className="flex items-center gap-4 mt-3">
                    <form action={updateCartItemQuantity} className="flex items-center gap-2">
                      <input type="hidden" name="itemId" value={item.id} />
                      <label className="text-xs text-(--color-muted)" htmlFor={`qty-${item.id}`}>Qty</label>
                      <select
                        id={`qty-${item.id}`}
                        name="quantity"
                        defaultValue={item.quantity}
                        className="field-input py-1 px-2 text-sm w-16"
                      >
                        {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((n) => (
                          <option key={n} value={n}>{n}</option>
                        ))}
                      </select>
                      <button type="submit" className="btn btn-outline btn-sm">Update</button>
                    </form>

                    <form action={removeCartItem}>
                      <input type="hidden" name="itemId" value={item.id} />
                      <button type="submit" className="link-quiet text-xs underline">Remove</button>
                    </form>
                  </div>
                </div>
                <p className="text-sm font-medium"><Money amount={lineTotal} /></p>
              </div>
            ))}
          </div>

          <div className="card-outline p-6 h-fit">
            <h2 className="eyebrow mb-4">Order Summary</h2>

            <form action={applyPromoCode} className="mb-4">
              <label className="field-label" htmlFor="code">Promo Code</label>
              <div className="flex gap-2">
                <input
                  id="code"
                  name="code"
                  defaultValue={cart.promoCode ?? ""}
                  placeholder="e.g. WELCOME15"
                  className="field-input"
                />
                <button type="submit" className="btn btn-outline btn-sm">Apply</button>
              </div>
              {promoError === "1" && (
                <p className="text-xs text-(--color-sale) mt-2">
                  That code is invalid or expired.
                </p>
              )}
              {promoApplied === "1" && (
                <p className="text-xs text-green-700 mt-2">Promo code applied.</p>
              )}
            </form>

            {cart.promoCode && (
              <form action={removePromoCode} className="mb-4">
                <button type="submit" className="link-quiet text-xs underline">
                  Remove code &ldquo;{cart.promoCode}&rdquo;
                </button>
              </form>
            )}

            <dl className="space-y-2 text-sm">
              <div className="flex justify-between">
                <dt className="text-(--color-muted)">Subtotal</dt>
                <dd><Money amount={totals.subtotal} /></dd>
              </div>
              {totals.discount > 0 && (
                <div className="flex justify-between text-(--color-sale)">
                  <dt>Discount</dt>
                  <dd>-<Money amount={totals.discount} /></dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-(--color-muted)">Shipping</dt>
                <dd>{totals.shipping === 0 ? "Free" : <Money amount={totals.shipping} />}</dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-(--color-muted)">Tax</dt>
                <dd><Money amount={totals.tax} /></dd>
              </div>
              <div className="flex justify-between font-medium text-base pt-2 border-t border-(--color-line)">
                <dt>Total</dt>
                <dd><Money amount={totals.total} /></dd>
              </div>
            </dl>

            <Link href="/checkout" className="btn btn-primary w-full mt-6">
              Proceed to Checkout
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
