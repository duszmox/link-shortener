"use client";

import { useEffect, useRef } from "react";
import ReCAPTCHA from "react-google-recaptcha";
import Cookies from "js-cookie";

export default function Captcha() {
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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
    const url = Cookies.get("url");
    if (recaptchaRef.current && url) {
      recaptchaRef.current.execute();
      window.location.href = url;
    }
  }, []);

  return (
    <form onSubmit={handleSubmit}>
      <ReCAPTCHA
        ref={recaptchaRef}
        size="invisible"
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        onChange={onReCAPTCHAChange}
      />
      <button type="submit">Loading...</button>
    </form>
  );
}
