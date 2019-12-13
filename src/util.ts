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
