import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updatePromotion } from "@/app/admin/(protected)/promotions/actions";

function fmtDate(d: Date) {
  return d.toISOString().slice(0, 10);
}

export default async function EditPromotionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const promotion = await db.promotion.findUnique({ where: { id } });
  if (!promotion) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-1">Edit Promotion</h1>
      <p className="text-sm text-[#9a9a9a] mb-6 font-mono">{promotion.code}</p>

      <form action={updatePromotion} className="grid grid-cols-2 gap-4 border border-[#3a3a3a] p-6">
        <input type="hidden" name="id" value={promotion.id} />
        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={promotion.name} required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="description">Description</label>
          <input id="description" name="description" defaultValue={promotion.description} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="discountType">Type</label>
          <select id="discountType" name="discountType" defaultValue={promotion.discountType} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm">
            <option value="percent">Percent Off</option>
            <option value="fixed">Fixed Amount Off</option>
            <option value="free_shipping">Free Shipping</option>
          </select>
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="discountValue">Value</label>
          <input id="discountValue" name="discountValue" type="number" step="0.01" defaultValue={promotion.discountValue} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="startDate">Start Date</label>
          <input id="startDate" name="startDate" type="date" defaultValue={fmtDate(promotion.startDate)} required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="endDate">End Date</label>
          <input id="endDate" name="endDate" type="date" defaultValue={fmtDate(promotion.endDate)} required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <button type="submit" className="bg-[#9c7a3c] text-[#1b1b1b] px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c]">
            Save Changes
          </button>
        </div>
      </form>
    </div>
  );
}
