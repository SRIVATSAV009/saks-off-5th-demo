import Link from "next/link";
import { getCurrentUser } from "@/lib/session";
import { db } from "@/lib/db";
import Money from "@/components/Money";
import { logout } from "@/app/login/actions";
import { updateProfile } from "@/app/account/actions";

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="container-page py-16 text-center">
        <h1 className="font-display text-3xl mb-3">My Account</h1>
        <p className="text-(--color-muted) mb-6">Sign in to view your account.</p>
        <Link href="/login?next=/account" className="btn btn-primary">Sign In</Link>
      </div>
    );
  }

  const recentOrders = await db.order.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    take: 3,
  });

  return (
    <div className="container-page py-8">
      <div className="flex items-baseline justify-between mb-8">
        <h1 className="font-display text-3xl">My Account</h1>
        <form action={logout}>
          <button type="submit" className="link-quiet text-sm underline">Sign Out</button>
        </form>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-8">
          <section className="card-outline p-6">
            <h2 className="eyebrow mb-4">Profile</h2>
            <form action={updateProfile} className="grid grid-cols-2 gap-4">
              <div>
                <label className="field-label" htmlFor="firstName">First Name</label>
                <input id="firstName" name="firstName" defaultValue={user.firstName} className="field-input" />
              </div>
              <div>
                <label className="field-label" htmlFor="lastName">Last Name</label>
                <input id="lastName" name="lastName" defaultValue={user.lastName} className="field-input" />
              </div>
              <div className="col-span-2">
                <label className="field-label">Email</label>
                <p className="text-sm">{user.email}</p>
              </div>
              <div className="col-span-2">
                <button type="submit" className="btn btn-outline btn-sm">Save Changes</button>
              </div>
            </form>
          </section>

          <section className="card-outline p-6">
            <div className="flex items-baseline justify-between mb-4">
              <h2 className="eyebrow">Recent Orders</h2>
              <Link href="/account/orders" className="link-quiet text-sm">View All</Link>
            </div>
            {recentOrders.length === 0 ? (
              <p className="text-sm text-(--color-muted)">No orders yet.</p>
            ) : (
              <ul className="divide-y divide-(--color-line)">
                {recentOrders.map((order) => (
                  <li key={order.id} className="py-3 flex justify-between text-sm">
                    <Link href={`/checkout/confirmation/${order.orderNumber}`} className="link-quiet">
                      {order.orderNumber} — {order.status}
                    </Link>
                    <span><Money amount={order.total} /></span>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>

        <div className="space-y-4">
          <Link href="/account/addresses" className="card-outline block p-6 hover:bg-(--color-paper-alt)">
            <h2 className="eyebrow mb-1">Addresses</h2>
            <p className="text-sm text-(--color-muted)">Manage saved shipping addresses</p>
          </Link>
          <Link href="/wishlist" className="card-outline block p-6 hover:bg-(--color-paper-alt)">
            <h2 className="eyebrow mb-1">Wishlist</h2>
            <p className="text-sm text-(--color-muted)">View saved items</p>
          </Link>
          <Link href="/cart" className="card-outline block p-6 hover:bg-(--color-paper-alt)">
            <h2 className="eyebrow mb-1">Bag</h2>
            <p className="text-sm text-(--color-muted)">Resume checkout</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
