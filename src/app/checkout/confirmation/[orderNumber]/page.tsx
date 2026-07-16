import Link from "next/link";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/session";
import Money from "@/components/Money";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;
  const user = await getCurrentUser();
  if (!user) notFound();

  const order = await db.order.findFirst({
    where: { orderNumber, userId: user.id },
    include: { items: true },
  });
  if (!order) notFound();

  return (
    <div className="container-page py-16 max-w-2xl">
      <p className="eyebrow">Order Confirmed</p>
      <h1 className="font-display text-3xl mt-1 mb-2">Thank you, {user.firstName}.</h1>
      <p className="text-(--color-muted) mb-8">
        Order <span className="font-mono">{order.orderNumber}</span> has been placed.
        A confirmation has been logged to your order history.
      </p>

      <div className="card-outline p-6 mb-8">
        <h2 className="eyebrow mb-3">Items</h2>
        <ul className="divide-y divide-(--color-line)">
          {order.items.map((item) => (
            <li key={item.id} className="py-3 flex justify-between text-sm">
              <span>
                {item.name} ({item.color}/{item.size}) × {item.quantity}
              </span>
              <span><Money amount={item.price * item.quantity} /></span>
            </li>
          ))}
        </ul>

        <dl className="space-y-2 text-sm mt-4 pt-4 border-t border-(--color-line)">
          <div className="flex justify-between">
            <dt className="text-(--color-muted)">Subtotal</dt>
            <dd><Money amount={order.subtotal} /></dd>
          </div>
          {order.discount > 0 && (
            <div className="flex justify-between text-(--color-sale)">
              <dt>Discount {order.promoCode ? `(${order.promoCode})` : ""}</dt>
              <dd>-<Money amount={order.discount} /></dd>
            </div>
          )}
          <div className="flex justify-between">
            <dt className="text-(--color-muted)">Shipping ({order.shipMethod})</dt>
            <dd>{order.shipping === 0 ? "Free" : <Money amount={order.shipping} />}</dd>
          </div>
          <div className="flex justify-between">
            <dt className="text-(--color-muted)">Tax</dt>
            <dd><Money amount={order.tax} /></dd>
          </div>
          <div className="flex justify-between font-medium text-base pt-2 border-t border-(--color-line)">
            <dt>Total</dt>
            <dd><Money amount={order.total} /></dd>
          </div>
        </dl>
      </div>

      <div className="card-outline p-6 mb-8 text-sm">
        <h2 className="eyebrow mb-3">Shipping To</h2>
        <p>
          {order.shipLine1}{order.shipLine2 ? `, ${order.shipLine2}` : ""}
          <br />
          {order.shipCity}, {order.shipState} {order.shipZip}
        </p>
      </div>

      <div className="flex gap-3">
        <Link href="/account/orders" className="btn btn-outline">View Order History</Link>
        <Link href="/products" className="btn btn-primary">Continue Shopping</Link>
      </div>
    </div>
  );
}
