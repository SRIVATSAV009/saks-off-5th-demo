import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { updateAsset } from "@/app/admin/(protected)/content-assets/actions";

export default async function EditContentAssetPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const asset = await db.contentAsset.findUnique({ where: { id } });
  if (!asset) notFound();

  return (
    <div className="max-w-2xl">
      <h1 className="font-display text-2xl mb-1">Edit Content Asset</h1>
      <p className="text-sm text-[#9a9a9a] mb-6 font-mono">{asset.assetId}</p>

      <form action={updateAsset} className="space-y-4 border border-[#3a3a3a] p-6">
        <input type="hidden" name="id" value={asset.id} />
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="name">Name</label>
          <input id="name" name="name" defaultValue={asset.name} required className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="body">Body</label>
          <textarea id="body" name="body" defaultValue={asset.body} required rows={3} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-xs uppercase tracking-wide text-[#9a9a9a] mb-1" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={asset.status} className="w-full bg-[#1b1b1b] border border-[#3a3a3a] px-3 py-2 text-sm">
            <option value="online">Online</option>
            <option value="offline">Offline</option>
          </select>
        </div>
        <button type="submit" className="bg-[#9c7a3c] text-[#1b1b1b] px-5 py-2 text-sm font-semibold uppercase tracking-wide hover:bg-[#b28e4c]">
          Save Changes
        </button>
      </form>
    </div>
  );
}
