import { db } from "@/lib/db";

// Mirrors SFCC Business Manager Content Slots: a slot is placed on a page
// template and resolves, at render time, to whichever Content Asset is
// currently assigned to it in the admin panel — as long as that asset is
// "online". Editors can swap the asset without a code deploy.
export default async function ContentSlot({ slotId }: { slotId: string }) {
  const slot = await db.contentSlot.findUnique({ where: { slotId } });
  if (!slot?.contentAssetId) return null;

  const asset = await db.contentAsset.findUnique({
    where: { assetId: slot.contentAssetId },
  });
  if (!asset || asset.status !== "online") return null;

  return <div className="promo-banner">{asset.body}</div>;
}
