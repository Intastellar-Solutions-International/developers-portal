/** GTM container + GA4 measurement — loaded only in production unless `VITE_ENABLE_ANALYTICS=true`. */
export const GTM_CONTAINER_ID = "GTM-N6G38ST";
export const GA_MEASUREMENT_ID = "G-86T4LDB766";

export function isAnalyticsEnabled(): boolean {
  if (import.meta.env.PROD) return true;
  return import.meta.env.VITE_ENABLE_ANALYTICS === "true";
}

/** Minified GTM bootstrap (matches Google’s snippet). */
export function gtmBootstrapScript(): string {
  return `(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.defer=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${GTM_CONTAINER_ID}');`;
}

/** GA4 gtag.js init after the async loader (pairs with gtag/js?id=…). */
export function gtagConfigScript(): string {
  return `window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${GA_MEASUREMENT_ID}');`;
}
