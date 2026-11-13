"use client";

import { useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Cookies from "js-cookie";
import { useConsent } from "@/lib/cookie-consent";

export default function Captcha() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const consent = useConsent();
  // Google's script (and its cookies) only loads with the visitor's consent
  const recaptchaAllowed = consent?.recaptcha === true;

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    recaptchaRef.current?.execute();
  };

  const onReCAPTCHAChange = (captchaCode: string | null) => {
    // A null code means the reCAPTCHA expired
    if (!captchaCode) return;
    // Reset so it can be executed again
    recaptchaRef.current?.reset();
  };

  // autosubmit the form and redirect to the url from the cookie
  useEffect(() => {
    // Wait until the consent cookie has been read on the client
    if (consent === undefined) return;
    const url = Cookies.get("url");
    if (!url) return;
    if (recaptchaAllowed) {
      if (!recaptchaRef.current) return;
      recaptchaRef.current.execute();
    }
    window.location.href = url;
  }, [consent, recaptchaAllowed]);

  return (
    <form onSubmit={handleSubmit}>
      {recaptchaAllowed && (
        <ReCAPTCHA
          ref={recaptchaRef}
          size="invisible"
          sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
          onChange={onReCAPTCHAChange}
        />
      )}
      <button type="submit">Loading...</button>
    </form>
  );
}
