"use server";

import { redirect } from "next/navigation";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { createUserSession, destroyUserSession } from "@/lib/session";
import { verifyRecaptcha } from "@/lib/recaptcha";

function safeNext(next: FormDataEntryValue | null): string {
  const value = String(next ?? "/account");
  // Only allow same-site relative paths to avoid open-redirects.
  return value.startsWith("/") ? value : "/account";
}

export async function login(formData: FormData) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const password = String(formData.get("password") ?? "");
  const recaptchaToken = String(formData.get("g-recaptcha-response") ?? "");
  const next = safeNext(formData.get("next"));

  const captchaOk = await verifyRecaptcha(recaptchaToken);
  if (!captchaOk) {
    redirect(`/login?error=captcha&next=${encodeURIComponent(next)}`);
  }

  const user = await db.user.findUnique({ where: { email } });
  const passwordOk = user ? await bcrypt.compare(password, user.passwordHash) : false;

  if (!user || !passwordOk) {
    redirect(`/login?error=invalid&next=${encodeURIComponent(next)}`);
  }

  await createUserSession(user.id);
  redirect(next);
}

export async function logout() {
  await destroyUserSession();
  redirect("/");
}
