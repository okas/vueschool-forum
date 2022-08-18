export function guidAsBase64() {
  return window.btoa(crypto.randomUUID());
}

export function getCountPhrase(count: number, singularItemName: string) {
  const phrase =
    count !== 1
      ? `${singularItemName.replace(/y$/i, "ie")}s`
      : singularItemName;

  return `${count !== 0 ? count : "no"} ${phrase}`;
}
