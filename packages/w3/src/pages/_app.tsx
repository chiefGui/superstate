import '@fontsource/plus-jakarta-sans/200.css'
import '@fontsource/plus-jakarta-sans/200-italic.css'
import '@fontsource/plus-jakarta-sans/400.css'
import '@fontsource/plus-jakarta-sans/400-italic.css'
import '@fontsource/plus-jakarta-sans/600.css'
import '@fontsource/plus-jakarta-sans/600-italic.css'
import '@fontsource/plus-jakarta-sans/800.css'
import '@fontsource/plus-jakarta-sans/800-italic.css'
import './styles.css'

import { AppProps } from 'next/app'
import Script from 'next/script'

function CustomApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Component {...pageProps} />

      <Script
        src='https://kit.fontawesome.com/1eff91cbd8.js'
        crossOrigin='anonymous'
      />
    </>
  )
}

export default CustomApp
