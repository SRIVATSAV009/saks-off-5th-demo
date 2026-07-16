import { db } from "@/lib/db";
import { assignSlot } from "@/app/admin/(protected)/content-slots/actions";

export default async function ContentSlotsPage({
  searchParams,
}: {
  searchParams: Promise<{ updated?: string }>;
}) {
  const { updated } = await searchParams;
  const [slots, assets] = await Promise.all([
    db.contentSlot.findMany({ orderBy: { slotId: "asc" } }),
    db.contentAsset.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Content Slots</h1>
      <p className="text-sm text-[#9a9a9a] mb-6">
        Slots are placed in storefront templates by code. Editors reassign which Content Asset
        renders in each slot here — no deploy needed, same as SFCC Business Manager.
      </p>

      {updated === "1" && (
        <p className="bg-[#233a26] border border-[#3a5a3f] text-[#a0e8a8] text-sm px-4 py-2 mb-6">
          Slot assignment updated.
        </p>
      )}

      <div className="space-y-4 max-w-2xl">
        {slots.map((slot) => (
          <form
            key={slot.id}
            action={assignSlot}
            className="border border-[#3a3a3a] p-5 flex flex-col md:flex-row md:items-end gap-4"
          >
            <input type="hidden" name="slotId" value={slot.slotId} />
            <div className="flex-1">
              <p className="font-mono text-sm">{slot.slotId}</p>
              <p className="text-xs text-[#9a9a9a]">Page: {slot.page}</p>
            </div>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1">
                Assigned Content Asset
              </label>
              <select
                name="contentAssetId"
                defaultValue={slot.contentAssetId ?? ""}
                className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm"
              >
                <option value="">— None —</option>
                {assets.map((a) => (
                  <option key={a.assetId} value={a.assetId}>
                    {a.name} {a.status === "offline" ? "(offline)" : ""}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              className="bg-[#9c7a3c] text-[#1b1b1b] px-4 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c] h-fit"
            >
              Save
            </button>
          </form>
        ))}
      </div>
    </div>
  );
}
