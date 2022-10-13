import { useChangeCase } from "@vueuse/integrations/useChangeCase";

export function getSentenceCase(message: string): string {
  return useChangeCase(message, "sentenceCase").value;
}
