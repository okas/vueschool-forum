import { useCommonStore } from "@/stores/common-store";

export function onErrorHandler(err: Error): void {
  useCommonStore().setLoading(false);
  console.error(err);
}
