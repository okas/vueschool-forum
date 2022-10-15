import { useChangeCase } from "@vueuse/integrations/useChangeCase";

/**
 * If input is falsy falsy string, then returns undefined.
 */
export function getSentenceCase(input: string | undefined): string | undefined {
  const str = input?.trim();
  return str ? useChangeCase(str, "sentenceCase").value : undefined;
}
