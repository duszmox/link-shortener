import '../styles/globals.css'
import { GoogleReCaptchaProvider } from "react-google-recaptcha-v3";
import type { AppProps } from 'next/app'

function MyApp({ Component, pageProps }: AppProps) {
return (
  <GoogleReCaptchaProvider
    reCaptchaKey={process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY!}
    scriptProps={{
      async: false,
      defer: false,
      appendTo: "head",
      nonce: undefined,
    }}
  >
    <Component {...pageProps} />
  </GoogleReCaptchaProvider>
);}

export default MyApp
