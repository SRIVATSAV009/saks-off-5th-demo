import Link from "next/link";
import Recaptcha from "@/components/Recaptcha";
import { login } from "@/app/login/actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="font-display text-3xl mb-2">Sign In</h1>
      <p className="text-sm text-(--color-muted) mb-8">
        Demo account: <span className="font-mono">jane.doe@example.com</span> /{" "}
        <span className="font-mono">password123</span>
      </p>

      {error === "invalid" && (
        <p className="toast-error px-4 py-2 text-sm mb-6">Incorrect email or password.</p>
      )}
      {error === "captcha" && (
        <p className="toast-error px-4 py-2 text-sm mb-6">
          Please complete the reCAPTCHA challenge.
        </p>
      )}

      <form action={login} className="space-y-5">
        <input type="hidden" name="next" value={next ?? "/account"} />
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" required className="field-input" />
        </div>

        <Recaptcha />

        <button type="submit" className="btn btn-primary w-full">Sign In</button>
      </form>

      <p className="text-sm text-(--color-muted) mt-6">
        New here?{" "}
        <Link href={`/register${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link-quiet underline">
          Create an account
        </Link>
      </p>
    </div>
  );
}
