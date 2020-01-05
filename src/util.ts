export function range(end: number, start: number = 0): number[] {
  return Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i);
}

export function to<A, T>(fn: (items: A[]) => T) {
  return (sum: any, _item: A, index: number, all: A[]): T => {
    const isLast = index === all.length - 1;

    if (!isLast) {
      return sum;
    }

    return fn(all);
  };
}

export function constant<T>(value: T): () => T {
  return () => value;
}

export function identity<T>(x: T): T {
  return x;
}

export function mapToIndexedObject<T, V, R extends { [key: string]: V }>(
  fn: (item: T, index: number) => [string, V],
  items: T[],
  initial: R = {} as R
): R {
  return items.reduce((sum, item, index) => {
    const [key, value] = fn(item, index);
    (sum as { [key: string]: V })[key] = value;
    return sum;
  }, initial);
}
