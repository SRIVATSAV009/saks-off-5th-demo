import Link from "next/link";
import Recaptcha from "@/components/Recaptcha";
import { register } from "@/app/register/actions";

const ERROR_MESSAGES: Record<string, string> = {
  captcha: "Please complete the reCAPTCHA challenge.",
  invalid: "Please fill out all fields with a password of at least 8 characters.",
  mismatch: "Passwords do not match.",
  exists: "An account with that email already exists.",
};

export default async function RegisterPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; next?: string }>;
}) {
  const { error, next } = await searchParams;

  return (
    <div className="container-page py-16 max-w-md">
      <h1 className="font-display text-3xl mb-8">Create Account</h1>

      {error && ERROR_MESSAGES[error] && (
        <p className="toast-error px-4 py-2 text-sm mb-6">{ERROR_MESSAGES[error]}</p>
      )}

      <form action={register} className="space-y-5">
        <input type="hidden" name="next" value={next ?? "/account"} />
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="field-label" htmlFor="firstName">First Name</label>
            <input id="firstName" name="firstName" required className="field-input" />
          </div>
          <div>
            <label className="field-label" htmlFor="lastName">Last Name</label>
            <input id="lastName" name="lastName" required className="field-input" />
          </div>
        </div>
        <div>
          <label className="field-label" htmlFor="email">Email</label>
          <input id="email" name="email" type="email" required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="password">Password</label>
          <input id="password" name="password" type="password" minLength={8} required className="field-input" />
        </div>
        <div>
          <label className="field-label" htmlFor="confirmPassword">Confirm Password</label>
          <input id="confirmPassword" name="confirmPassword" type="password" minLength={8} required className="field-input" />
        </div>

        <Recaptcha />

        <button type="submit" className="btn btn-primary w-full">Create Account</button>
      </form>

      <p className="text-sm text-(--color-muted) mt-6">
        Already have an account?{" "}
        <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="link-quiet underline">
          Sign in
        </Link>
      </p>
    </div>
  );
}
