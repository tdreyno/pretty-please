export function range(end: number, start = 0): number[] {
  return Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i)
}

export function to<A, T>(fn: (items: A[]) => T) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (sum: any, _item: A, index: number, all: A[]): T => {
    const isLast = index === all.length - 1

    if (!isLast) {
      return sum
    }

    return fn(all)
  }
}

export function constant<T>(value: T): () => T {
  return () => value
}

export function identity<T>(x: T): T {
  return x
}

export function toIndexedObject<T, V, R extends { [key: string]: V }>(
  fn: (item: T, index: number) => [string, V]
) {
  return (sum: R, item: T, index: number) => {
    const [key, value] = fn(item, index)
    ;(sum as { [key: string]: V })[key] = value
    return sum
  }
}

export function mapToIndexedObject<T, V, R extends { [key: string]: V }>(
  fn: (item: T, index: number) => [string, V],
  items: T[],
  initial: R = {} as R
): R {
  return items.reduce(toIndexedObject<T, V, R>(fn), initial)
}

export function pairsToIndexedObject<V, R extends { [key: string]: V }>(
  sum: R,
  [key, value]: [string, V]
) {
  ;(sum as { [key: string]: V })[key] = value

  return sum
}
