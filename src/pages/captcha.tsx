import ReCAPTCHA from "react-google-recaptcha";
import React, { RefObject, useEffect, useRef } from "react";
import Cookies from "js-cookie";


export default function Captcha() {
//   get the url from the url cookie
    const url = Cookies.get("url");
  const recaptchaRef = useRef<ReCAPTCHA>(null);
  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    // Execute the reCAPTCHA when the form is submitted
    if (recaptchaRef.current) 
    {
        recaptchaRef.current.execute();
        console.log("executed")
    }

  };

  const onReCAPTCHAChange = (captchaCode: any) => {
    // If the reCAPTCHA code is null or undefined indicating that
    // the reCAPTCHA was expired then return early
    if (!captchaCode) {
      return;
    }
    // Else reCAPTCHA was executed successfully so proceed with the
    // alert
    // Reset the reCAPTCHA so that it can be executed again if user
    // submits another email.
    if (recaptchaRef.current) recaptchaRef.current.reset();
  };
//   autosubmit the form
    useEffect(() => {
        if (recaptchaRef.current) {
            recaptchaRef.current.execute();
            // redirect to the url
            window.location.href = url!;
        }
    }, [url]);


  return (
    <form onSubmit={handleSubmit}>
      <ReCAPTCHA
        ref={recaptchaRef as RefObject<ReCAPTCHA>}
        size="invisible"
        sitekey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
        onChange={onReCAPTCHAChange}
      />
      <button type="submit">
        Loading...
      </button>
    </form>
  );
}
