import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import Money from "@/components/Money";

export default async function OrderHistoryPage() {
  const user = await getCurrentUser();
  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">Order History</h1>
        <p className="text-(--color-muted) mb-6">Sign in to view your orders.</p>
        <Link href="/login?next=/account/orders" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const orders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: { items: true },
  });

  return (
    <div className="container-page py-8">
      <h1 className="font-display text-3xl mb-8">Order History</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-(--color-muted) mb-6">You haven&apos;t placed any orders yet.</p>
          <Link href="/products" className="btn btn-primary">Shop Now</Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div key={order.id} className="card-outline p-6">
              <div className="flex flex-wrap justify-between gap-2 mb-3">
                <div>
                  <p className="text-sm font-medium font-mono">{order.orderNumber}</p>
                  <p className="text-xs text-(--color-muted)">
                    {order.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                    {" · "}{order.status}
                  </p>
                </div>
                <p className="text-sm font-medium"><Money amount={order.total} /></p>
              </div>
              <p className="text-sm text-(--color-muted) mb-3">
                {order.items.map((i) => i.name).join(", ")}
              </p>
              <Link href={`/checkout/confirmation/${order.orderNumber}`} className="link-quiet text-sm underline">
                View Details
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
