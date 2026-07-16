import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { getOrCreateCart } from "@/lib/cart";
import { db } from "@/lib/db";
import { toProductView } from "@/lib/product";
import { computeTotals, isPromotionActive, SHIPPING_METHODS } from "@/lib/pricing";
import Money from "@/components/Money";
import Recaptcha from "@/components/Recaptcha";
import ContentSlot from "@/components/ContentSlot";
import { placeOrder } from "@/app/checkout/actions";

const ERROR_MESSAGES: Record<string, string> = {
  captcha: "Please complete the reCAPTCHA challenge.",
  address: "Please provide a complete shipping address.",
  payment: "Please enter valid payment details.",
};

export default async function CheckoutPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Checkout</h1>
        <p className="text-(--color-muted) mb-6">Sign in to check out.</p>
        <Link href="/login?next=/checkout" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const [cart, addresses] = await Promise.all([
    getOrCreateCart(user.id),
    db.address.findMany({ where: { userId: user.id }, orderBy: { isDefault: "desc" } }),
  ]);

  const cartItems = await db.cartItem.findMany({
    where: { cartId: cart.id },
    include: { product: true },
  });

  if (cartItems.length === 0) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Checkout</h1>
        <p className="text-(--color-muted) mb-6">Your bag is empty.</p>
        <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    );
  }

  const promotion = cart.promoCode
    ? await db.promotion.findUnique({ where: { code: cart.promoCode } })
    : null;
  const promotionActive = promotion && isPromotionActive(promotion) ? promotion : null;

  const lines = cartItems.map((item) => {
    const view = toProductView(item.product);
    return { item, view, lineTotal: view.effectivePrice * item.quantity };
  });

  const standardTotals = computeTotals(lines.map((l) => ({ lineTotal: l.lineTotal })), promotionActive, "standard");
  const expressTotals = computeTotals(lines.map((l) => ({ lineTotal: l.lineTotal })), promotionActive, "express");

  return (
    <div className="container-page py-8">
      <ContentSlot slotId="checkout-banner" />
      <h1 className="font-display text-3xl my-8">Checkout</h1>

      {error && ERROR_MESSAGES[error] && (
        <p className="toast-error px-4 py-2 text-sm mb-6">{ERROR_MESSAGES[error]}</p>
      )}

      <form action={placeOrder} className="grid md:grid-cols-3 gap-10">
        <div className="md:col-span-2 space-y-8">
          <section>
            <h2 className="eyebrow mb-3">Shipping Address</h2>
            <div className="space-y-3">
              {addresses.map((addr) => (
                <label key={addr.id} className="card-outline flex items-start gap-3 p-4 cursor-pointer">
                  <input type="radio" name="addressId" value={addr.id} defaultChecked={addr.isDefault} className="mt-1" />
                  <span className="text-sm">
                    <span className="font-medium">{addr.label}</span>
                    <br />
                    {addr.line1}{addr.line2 ? `, ${addr.line2}` : ""}
                    <br />
                    {addr.city}, {addr.state} {addr.zip}
                  </span>
                </label>
              ))}
              <label className="card-outline flex items-start gap-3 p-4 cursor-pointer">
                <input type="radio" name="addressId" value="new" defaultChecked={addresses.length === 0} className="mt-1" />
                <span className="text-sm font-medium">Ship to a new address</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4 mt-4">
              <div className="col-span-2">
                <label className="field-label" htmlFor="line1">Address Line 1</label>
                <input id="line1" name="line1" className="field-input" />
              </div>
              <div className="col-span-2">
                <label className="field-label" htmlFor="line2">Address Line 2</label>
                <input id="line2" name="line2" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="city">City</label>
                <input id="city" name="city" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="state">State</label>
                <input id="state" name="state" className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="zip">ZIP Code</label>
                <input id="zip" name="zip" className="field-input" />
              </div>
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3">Shipping Method</h2>
            <div className="space-y-2">
              {(Object.keys(SHIPPING_METHODS) as (keyof typeof SHIPPING_METHODS)[]).map((key) => {
                const totals = key === "express" ? expressTotals : standardTotals;
                return (
                  <label key={key} className="card-outline flex items-center justify-between p-4 cursor-pointer">
                    <span className="flex items-center gap-3 text-sm">
                      <input type="radio" name="shippingMethod" value={key} defaultChecked={key === "standard"} />
                      {SHIPPING_METHODS[key].label}
                    </span>
                    <span className="text-sm">
                      {totals.shipping === 0 ? "Free" : <Money amount={totals.shipping} />}
                    </span>
                  </label>
                );
              })}
            </div>
          </section>

          <section>
            <h2 className="eyebrow mb-3">Payment (Demo — No Real Charge)</h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="field-label" htmlFor="cardName">Name on Card</label>
                <input id="cardName" name="cardName" className="field-input" defaultValue={`${user.firstName} ${user.lastName}`} />
              </div>
              <div className="col-span-2">
                <label className="field-label" htmlFor="cardNumber">Card Number</label>
                <input id="cardNumber" name="cardNumber" className="field-input" placeholder="4111 1111 1111 1111" defaultValue="4111 1111 1111 1111" />
              </div>
              <div>
                <label className="field-label" htmlFor="cardExpiry">Expiry</label>
                <input id="cardExpiry" name="cardExpiry" className="field-input" placeholder="MM/YY" defaultValue="12/29" />
              </div>
              <div>
                <label className="field-label" htmlFor="cardCvv">CVV</label>
                <input id="cardCvv" name="cardCvv" className="field-input" placeholder="123" defaultValue="123" />
              </div>
            </div>
          </section>

          <Recaptcha />
        </div>

        <div className="card-outline p-6 h-fit">
          <h2 className="eyebrow mb-4">Order Summary</h2>
          <ul className="space-y-2 text-sm mb-4">
            {lines.map(({ item, lineTotal }) => (
              <li key={item.id} className="flex justify-between gap-2">
                <span className="text-(--color-muted)">
                  {item.product.name} ({item.color}/{item.size}) × {item.quantity}
                </span>
                <span><Money amount={lineTotal} /></span>
              </li>
            ))}
          </ul>
          {promotionActive && (
            <p className="text-xs text-(--color-muted) mb-3">
              Promo applied: <span className="font-mono">{promotionActive.code}</span>
            </p>
          )}
          <dl className="space-y-2 text-sm">
            <div className="flex justify-between">
              <dt className="text-(--color-muted)">Subtotal</dt>
              <dd><Money amount={standardTotals.subtotal} /></dd>
            </div>
            {standardTotals.discount > 0 && (
              <div className="flex justify-between text-(--color-sale)">
                <dt>Discount</dt>
                <dd>-<Money amount={standardTotals.discount} /></dd>
              </div>
            )}
            <div className="flex justify-between font-medium text-base pt-2 border-t border-(--color-line)">
              <dt>Estimated Total</dt>
              <dd><Money amount={standardTotals.total} /></dd>
            </div>
          </dl>
          <p className="text-xs text-(--color-muted) mt-2">
            Final total reflects your selected shipping method.
          </p>

          <button type="submit" className="btn btn-primary w-full mt-6">
            Place Order
          </button>
        </div>
      </form>
    </div>
  );
}
