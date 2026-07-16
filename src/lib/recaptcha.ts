// Server-side verification for Google reCAPTCHA. Called from the login,
// register, and checkout server actions before any account/order mutation
// runs, so bot submissions are rejected before they touch the database.
export async function verifyRecaptcha(token: string | null | undefined): Promise<boolean> {
  if (!token) return false;

  const secret = process.env.RECAPTCHA_SECRET_KEY;
  if (!secret) {
    console.warn("RECAPTCHA_SECRET_KEY is not set; failing closed.");
    return false;
  }

  try {
    const res = await fetch("https://www.google.com/recaptcha/api/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ secret, response: token }),
    });
    const data = (await res.json()) as { success: boolean };
    return data.success === true;
  } catch (err) {
    console.error("reCAPTCHA verification request failed", err);
    return false;
  }
}
