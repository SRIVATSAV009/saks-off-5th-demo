"use server";

import { revalidatePath } from "next/cache";
import { db } from "@/lib/db";
import { requireUserIdOrRedirect } from "@/lib/session";

export async function updateProfile(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/account");
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  if (!firstName || !lastName) return;

  await db.user.update({ where: { id: userId }, data: { firstName, lastName } });
  revalidatePath("/account");
  revalidatePath("/", "layout");
}

export async function addAddress(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/account/addresses");
  const label = String(formData.get("label") ?? "Address").trim() || "Address";
  const line1 = String(formData.get("line1") ?? "").trim();
  const line2 = String(formData.get("line2") ?? "").trim();
  const city = String(formData.get("city") ?? "").trim();
  const state = String(formData.get("state") ?? "").trim();
  const zip = String(formData.get("zip") ?? "").trim();
  if (!line1 || !city || !state || !zip) return;

  const existingCount = await db.address.count({ where: { userId } });
  await db.address.create({
    data: {
      userId,
      label,
      line1,
      line2: line2 || null,
      city,
      state,
      zip,
      isDefault: existingCount === 0,
    },
  });
  revalidatePath("/account/addresses");
}

export async function deleteAddress(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/account/addresses");
  const addressId = String(formData.get("addressId"));
  await db.address.deleteMany({ where: { id: addressId, userId } });
  revalidatePath("/account/addresses");
}

export async function setDefaultAddress(formData: FormData) {
  const userId = await requireUserIdOrRedirect("/account/addresses");
  const addressId = String(formData.get("addressId"));

  await db.$transaction([
    db.address.updateMany({ where: { userId }, data: { isDefault: false } }),
    db.address.updateMany({ where: { id: addressId, userId }, data: { isDefault: true } }),
  ]);
  revalidatePath("/account/addresses");
}
