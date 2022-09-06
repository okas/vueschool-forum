export function ok<TValue>(value: TValue, message: string): asserts value {
  if (!value) {
    throw Error(message);
  }
}
