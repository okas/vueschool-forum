export function tryGetSeconds<
  THasSeconds extends { seconds: number } | undefined | null
>(fbTimeStampOrAsIs: THasSeconds | number): number {
  return typeof fbTimeStampOrAsIs === "number"
    ? fbTimeStampOrAsIs
    : fbTimeStampOrAsIs?.seconds ?? 0;
}
