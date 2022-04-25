export function guidAsBase64() {
  return window.btoa(crypto.randomUUID());
}
