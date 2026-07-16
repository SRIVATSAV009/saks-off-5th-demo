import Link from "next/link";
import { db } from "@/lib/db";
import { isPromotionActive } from "@/lib/pricing";
import { createPromotion, togglePromotion, deletePromotion } from "@/app/admin/(protected)/promotions/actions";

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function AdminPromotionsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }>;
}) {
  const { error, created, updated } = await searchParams;
  const promotions = await db.promotion.findMany({ orderBy: { createdAt: "desc" } });
  const today = new Date();
  const in30Days = new Date(today);
  in30Days.setDate(in30Days.getDate() + 30);
  const todayStr = fmtDate(today);
  const in30DaysStr = fmtDate(in30Days);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Promotions</h1>
      <p className="text-sm text-[#9a9a9a] mb-6">
        Cart-level discount codes — validated against enabled/date-range at checkout, same as SFCC promotion campaigns.
      </p>

      {error === "1" && (
        <p className="bg-[#3a2323] border border-[#5a3a3a] text-[#e8a0a0] text-sm px-4 py-2 mb-6">
          Please fill out code, name, and valid dates.
        </p>
      )}
      {created === "1" && (
        <p className="bg-[#233a26] border border-[#3a5a3f] text-[#a0e8a8] text-sm px-4 py-2 mb-6">
          Promotion created.
        </p>
      )}
      {updated === "1" && (
        <p className="bg-[#233a26] border border-[#3a5a3f] text-[#a0e8a8] text-sm px-4 py-2 mb-6">
          Promotion updated.
        </p>
      )}

      <table className="w-full text-sm border-collapse mb-10">
        <thead>
          <tr className="text-left text-[#9a9a9a] border-b border-[#3a3a3a]">
            <th className="py-2 pr-4 font-normal">Code</th>
            <th className="py-2 pr-4 font-normal">Name</th>
            <th className="py-2 pr-4 font-normal">Discount</th>
            <th className="py-2 pr-4 font-normal">Dates</th>
            <th className="py-2 pr-4 font-normal">Status</th>
            <th className="py-2 pr-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {promotions.map((p) => {
            const active = isPromotionActive(p);
            return (
              <tr key={p.id} className="border-b border-[#2a2a2a] align-top">
                <td className="py-3 pr-4 font-mono">{p.code}</td>
                <td className="py-3 pr-4">{p.name}</td>
                <td className="py-3 pr-4">
                  {p.discountType === "percent" && `${p.discountValue}% off`}
                  {p.discountType === "fixed" && `$${p.discountValue.toFixed(2)} off`}
                  {p.discountType === "free_shipping" && "Free shipping"}
                </td>
                <td className="py-3 pr-4 text-xs">
                  {fmtDate(p.startDate)} – {fmtDate(p.endDate)}
                </td>
                <td className="py-3 pr-4">
                  <span className={active ? "text-[#a0e8a8]" : "text-[#9a9a9a]"}>
                    {p.enabled ? (active ? "Active" : "Enabled (out of range)") : "Disabled"}
                  </span>
                </td>
                <td className="py-3 pr-4">
                  <div className="flex flex-col gap-1 items-start">
                    <Link href={`/admin/promotions/${p.id}/edit`} className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                      Edit
                    </Link>
                    <form action={togglePromotion}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                        {p.enabled ? "Disable" : "Enable"}
                      </button>
                    </form>
                    <form action={deletePromotion}>
                      <input type="hidden" name="id" value={p.id} />
                      <button type="submit" className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                        Delete
                      </button>
                    </form>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      <section className="border border-[#3a3a3a] p-6 max-w-2xl">
        <h2 className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-4">New Promotion</h2>
        <form action={createPromotion} className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="code">Code</label>
            <input id="code" name="code" required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="name">Name</label>
            <input id="name" name="name" required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="description">Description</label>
            <input id="description" name="description" className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="discountType">Type</label>
            <select id="discountType" name="discountType" className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm">
              <option value="percent">Percent Off</option>
              <option value="fixed">Fixed Amount Off</option>
              <option value="free_shipping">Free Shipping</option>
            </select>
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="discountValue">Value</label>
            <input id="discountValue" name="discountValue" type="number" step="0.01" defaultValue="10" className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="startDate">Start Date</label>
            <input id="startDate" name="startDate" type="date" required defaultValue={todayStr} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="endDate">End Date</label>
            <input id="endDate" name="endDate" type="date" required defaultValue={in30DaysStr} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-[#9c7a3c] text-[#1b1b1b] px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c]">
              Create Promotion
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}
