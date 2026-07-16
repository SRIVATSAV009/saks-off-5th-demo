import Link from "next/link";
import { db } from "@/lib/db";

export default async function AdminDashboardPage() {
  const [productCount, orderCount, activePromoCount, jobCount, recentOrders] = await Promise.all([
    db.product.count(),
    db.order.count(),
    db.promotion.count({ where: { enabled: true } }),
    db.job.count(),
    db.order.findMany({ orderBy: { createdAt: "desc" }, take: 5, include: { user: true } }),
  ]);

  const stats = [
    { label: "Products", value: productCount, href: "/products" },
    { label: "Orders Placed", value: orderCount, href: "/admin" },
    { label: "Active Promotions", value: activePromoCount, href: "/admin/promotions" },
    { label: "Scheduled Jobs", value: jobCount, href: "/admin/jobs" },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl mb-6">Dashboard</h1>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10">
        {stats.map((s) => (
          <Link key={s.label} href={s.href} className="border border-[#3a3a3a] p-5 hover:bg-[#242424]">
            <p className="text-3xl font-display">{s.value}</p>
            <p className="text-xs uppercase tracking-wide text-[#9a9a9a] mt-1">{s.label}</p>
          </Link>
        ))}
      </div>

      <h2 className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-3">Recent Orders</h2>
      {recentOrders.length === 0 ? (
        <p className="text-sm text-[#9a9a9a]">No orders yet.</p>
      ) : (
        <table className="w-full text-sm border-collapse">
          <thead>
            <tr className="text-left text-[#9a9a9a] border-b border-[#3a3a3a]">
              <th className="py-2 pr-4 font-normal">Order #</th>
              <th className="py-2 pr-4 font-normal">Customer</th>
              <th className="py-2 pr-4 font-normal">Status</th>
              <th className="py-2 pr-4 font-normal">Total</th>
            </tr>
          </thead>
          <tbody>
            {recentOrders.map((o) => (
              <tr key={o.id} className="border-b border-[#2a2a2a]">
                <td className="py-2 pr-4 font-mono">{o.orderNumber}</td>
                <td className="py-2 pr-4">{o.user.firstName} {o.user.lastName}</td>
                <td className="py-2 pr-4">{o.status}</td>
                <td className="py-2 pr-4">${o.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
