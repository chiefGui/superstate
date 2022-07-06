export function isRunningOnServer() {
  // We are using `document` instead of `window`
  // because deno may have `window` defined.
  return typeof document === 'undefined'
}
