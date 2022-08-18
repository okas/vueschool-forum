export function _isFulFilled<T>(
  v: PromiseSettledResult<T>
): v is PromiseFulfilledResult<T> {
  return v.status === "fulfilled";
}
