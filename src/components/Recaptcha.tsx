import Script from "next/script";

// Renders Google's reCAPTCHA v2 "I'm not a robot" checkbox. The script
// auto-injects a hidden `g-recaptcha-response` field inside this div, which
// server actions read from FormData and verify via src/lib/recaptcha.ts.
export default function Recaptcha() {
  const siteKey = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;
  return (
    <div>
      <Script src="https://www.google.com/recaptcha/api.js" strategy="afterInteractive" />
      <div className="g-recaptcha" data-sitekey={siteKey} />
    </div>
  );
}
