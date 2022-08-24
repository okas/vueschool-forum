export function isFulFilled<T>(
  v: PromiseSettledResult<T>
): v is PromiseFulfilledResult<T> {
  return v.status === "fulfilled";
}
