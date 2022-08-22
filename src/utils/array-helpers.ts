export function groupBy<T>(array: T[], predicate: (v: T) => string) {
  return array.reduce((acc, value) => {
    (acc[predicate(value)] ||= []).push(value);
    return acc;
  }, {} as { [key: string]: T[] });
}

export function groupByToMap<T, Q>(
  array: T[],
  predicate: (value: T, index: number, array: T[]) => Q
) {
  return array.reduce((map, value, index, array) => {
    const key = predicate(value, index, array);
    map.get(key)?.push(value) ?? map.set(key, [value]);
    return map;
  }, new Map<Q, T[]>());
}

export function findById<TId, TItem extends { id: TId }>(
  array: Array<TItem>,
  findId: TId
): TItem | undefined {
  return array.find(({ id }) => id === findId);
}

export function countBy<TItem>(
  array: Array<TItem>,
  predicate: (item: TItem) => boolean
): number {
  return array.reduce((count, item) => count + Number(predicate(item)), 0);
}

export function countById<TId, TItem extends { id: TId }>(
  array: Array<TItem>,
  countId: TId
): number {
  return countBy(array, ({ id }) => id === countId);
}

export function* toBuckets<T>(
  array: Array<T>,
  size: number
): Generator<Array<T>> {
  if (!size) {
    return;
  }

  let start = 0;
  let end = 0;

  while (start < array.length) {
    end = start + size - 1;
    yield array.slice(start, end);
    start = end + 1;
  }
}

export function upsert<TId, TItem extends { id: TId }>(
  array: Array<TItem>,
  ...items: Array<TItem>
): number {
  items.forEach((item) => {
    const existing = array.find(({ id }) => id === item.id);

    if (existing) {
      Object.assign(existing, item);
    } else {
      array.push(item);
    }
  });

  return array.length;
}
