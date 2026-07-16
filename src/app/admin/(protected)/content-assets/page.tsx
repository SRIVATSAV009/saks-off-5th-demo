import Link from "next/link";
import { db } from "@/lib/db";
import { createAsset, toggleAssetStatus, deleteAsset } from "@/app/admin/(protected)/content-assets/actions";

export default async function ContentAssetsPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; created?: string; updated?: string }>;
}) {
  const { error, created, updated } = await searchParams;
  const assets = await db.contentAsset.findMany({ orderBy: { updatedAt: "desc" } });

  return (
    <div>
      <h1 className="font-display text-2xl mb-1">Content Assets</h1>
      <p className="text-sm text-[#9a9a9a] mb-6">
        Reusable content blocks (banners, copy) that Content Slots render on storefront pages — the SFCC content-asset/slot pattern.
      </p>

      {error === "1" && (
        <p className="bg-[#3a2323] border border-[#5a3a3a] text-[#e8a0a0] text-sm px-4 py-2 mb-6">
          Please fill out asset ID, name, and body.
        </p>
      )}
      {error === "inuse" && (
        <p className="bg-[#3a2323] border border-[#5a3a3a] text-[#e8a0a0] text-sm px-4 py-2 mb-6">
          This asset is assigned to a Content Slot. Unassign it first.
        </p>
      )}
      {created === "1" && (
        <p className="bg-[#233a26] border border-[#3a5a3f] text-[#a0e8a8] text-sm px-4 py-2 mb-6">Asset created.</p>
      )}
      {updated === "1" && (
        <p className="bg-[#233a26] border border-[#3a5a3f] text-[#a0e8a8] text-sm px-4 py-2 mb-6">Asset updated.</p>
      )}

      <table className="w-full text-sm border-collapse mb-10">
        <thead>
          <tr className="text-left text-[#9a9a9a] border-b border-[#3a3a3a]">
            <th className="py-2 pr-4 font-normal">Asset ID</th>
            <th className="py-2 pr-4 font-normal">Name</th>
            <th className="py-2 pr-4 font-normal">Body</th>
            <th className="py-2 pr-4 font-normal">Status</th>
            <th className="py-2 pr-4 font-normal">Actions</th>
          </tr>
        </thead>
        <tbody>
          {assets.map((a) => (
            <tr key={a.id} className="border-b border-[#2a2a2a] align-top">
              <td className="py-3 pr-4 font-mono text-xs">{a.assetId}</td>
              <td className="py-3 pr-4">{a.name}</td>
              <td className="py-3 pr-4 text-xs text-[#9a9a9a] max-w-xs">{a.body}</td>
              <td className="py-3 pr-4">
                <span className={a.status === "online" ? "text-[#a0e8a8]" : "text-[#9a9a9a]"}>
                  {a.status === "online" ? "Online" : "Offline"}
                </span>
              </td>
              <td className="py-3 pr-4">
                <div className="flex flex-col gap-1 items-start">
                  <Link href={`/admin/content-assets/${a.id}/edit`} className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                    Edit
                  </Link>
                  <form action={toggleAssetStatus}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                      {a.status === "online" ? "Take Offline" : "Bring Online"}
                    </button>
                  </form>
                  <form action={deleteAsset}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" className="text-xs underline text-[#9a9a9a] hover:text-[#e8e8e8]">
                      Delete
                    </button>
                  </form>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <section className="border border-[#3a3a3a] p-6 max-w-2xl">
        <h2 className="text-xs uppercase tracking-wide text-[#9a9a9a] mb-4">New Content Asset</h2>
        <form action={createAsset} className="space-y-4">
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="assetId">Asset ID</label>
            <input id="assetId" name="assetId" placeholder="e.g. fall-sale-banner" required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm font-mono" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="name">Name</label>
            <input id="name" name="name" required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="body">Body</label>
            <textarea id="body" name="body" required rows={2} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="status">Status</label>
            <select id="status" name="status" className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm">
              <option value="online">Online</option>
              <option value="offline">Offline</option>
            </select>
          </div>
          <button type="submit" className="bg-[#9c7a3c] text-[#1b1b1b] px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c]">
            Create Asset
          </button>
        </form>
      </section>
    </div>
  );
}
