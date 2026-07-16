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

export async function assignSlot(formData: FormData) {
  await requireAdmin();

  const slotId = String(formData.get("slotId"));
  const contentAssetId = String(formData.get("contentAssetId") ?? "");

  await db.contentSlot.update({
    where: { slotId },
    data: { contentAssetId: contentAssetId || null },
  });

  revalidatePath("/admin/content-slots");
  revalidatePath("/", "layout");
  revalidatePath("/products");
  revalidatePath("/checkout");
  redirect("/admin/content-slots?updated=1");
}
