"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createUserSession } from "@/lib/session";
import { verifyRecaptcha } from "@/lib/recaptcha";

function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "/account");
  return value.startsWith("/") ? value : "/account";
}

export async function register(formData: FormData) {
  const firstName = String(formData.get("firstName") ?? "").trim();
  const lastName = String(formData.get("lastName") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const recaptchaToken = String(formData.get("g-recaptcha-response") ?? "");
  const next = safeNext(formData.get("next"));

  const captchaOk = await verifyRecaptcha(recaptchaToken);
  if (!captchaOk) {
    redirect(`/register?error=captcha&next=${encodeURIComponent(next)}`);
  }

  if (!firstName || !lastName || !email || password.length < 8) {
    redirect(`/register?error=invalid&next=${encodeURIComponent(next)}`);
  }
  if (password !== confirmPassword) {
    redirect(`/register?error=mismatch&next=${encodeURIComponent(next)}`);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    redirect(`/register?error=exists&next=${encodeURIComponent(next)}`);
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      cart: { create: {} },
      wishlist: { create: {} },
    },
  });

  await createUserSession(user.id);
  redirect(next);
}
