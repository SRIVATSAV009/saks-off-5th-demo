"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { isAdminAuthenticated } from "@/lib/session";

async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    redirect("/admin/login");
  }
}

function revalidateStorefront() {
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/checkout");
}

export async function createAsset(formData: FormData) {
  await requireAdmin();

  const assetId = String(formData.get("assetId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "online");

  if (!assetId || !name || !body) {
    redirect("/admin/content-assets?error=1");
  }

  await db.contentAsset.create({ data: { assetId, name, body, status } });

  revalidatePath("/admin/content-assets");
  revalidateStorefront();
  redirect("/admin/content-assets?created=1");
}

export async function updateAsset(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const body = String(formData.get("body") ?? "").trim();
  const status = String(formData.get("status") ?? "online");

  await db.contentAsset.update({ where: { id }, data: { name, body, status } });

  revalidatePath("/admin/content-assets");
  revalidateStorefront();
  redirect("/admin/content-assets?updated=1");
}

export async function toggleAssetStatus(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const asset = await db.contentAsset.findUnique({ where: { id } });
  if (!asset) return;

  await db.contentAsset.update({
    where: { id },
    data: { status: asset.status === "online" ? "offline" : "online" },
  });

  revalidatePath("/admin/content-assets");
  revalidateStorefront();
}

export async function deleteAsset(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));

  const inUse = await db.contentSlot.findFirst({
    where: { contentAssetId: (await db.contentAsset.findUnique({ where: { id } }))?.assetId },
  });
  if (inUse) {
    redirect("/admin/content-assets?error=inuse");
  }

  await db.contentAsset.delete({ where: { id } });
  revalidatePath("/admin/content-assets");
  revalidateStorefront();
}
