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

export function getValOrFirst<TValue>(
  obj: TValue | TValue[] | null | undefined
): TValue | undefined {
  return obj ? (Array.isArray(obj) ? obj[0] : obj) : undefined;
}

export function getProfileTitle(name: string) {
  return `${name || "## n/a ##"}'s profile picture`;
}

export function truncate(text: string, length: number, suffix = "..."): string {
  return text.length > length ? text.substring(0, length) + suffix : text;
}
