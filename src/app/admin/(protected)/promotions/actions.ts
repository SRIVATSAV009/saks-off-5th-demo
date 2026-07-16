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

export async function createPromotion(formData: FormData) {
  await requireAdmin();

  const code = String(formData.get("code") ?? "").trim().toUpperCase();
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const discountType = String(formData.get("discountType") ?? "percent");
  const discountValue = Number(formData.get("discountValue")) || 0;
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));

  if (!code || !name || Number.isNaN(startDate.getTime()) || Number.isNaN(endDate.getTime())) {
    redirect("/admin/promotions?error=1");
  }

  await db.promotion.create({
    data: { code, name, description, discountType, discountValue, startDate, endDate, enabled: true },
  });

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions?created=1");
}

export async function updatePromotion(formData: FormData) {
  await requireAdmin();

  const id = String(formData.get("id"));
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const discountType = String(formData.get("discountType") ?? "percent");
  const discountValue = Number(formData.get("discountValue")) || 0;
  const startDate = new Date(String(formData.get("startDate")));
  const endDate = new Date(String(formData.get("endDate")));

  await db.promotion.update({
    where: { id },
    data: { name, description, discountType, discountValue, startDate, endDate },
  });

  revalidatePath("/admin/promotions");
  redirect("/admin/promotions?updated=1");
}

export async function togglePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  const promotion = await db.promotion.findUnique({ where: { id } });
  if (!promotion) return;

  await db.promotion.update({ where: { id }, data: { enabled: !promotion.enabled } });
  revalidatePath("/admin/promotions");
}

export async function deletePromotion(formData: FormData) {
  await requireAdmin();
  const id = String(formData.get("id"));
  await db.promotion.delete({ where: { id } });
  revalidatePath("/admin/promotions");
}
