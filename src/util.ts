export const range = (end: number, start = 0): number[] =>
  Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i)

export const to = <A, T>(fn: (items: A[]) => T) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  (sum: any, _item: A, index: number, all: A[]): T => {
    const isLast = index === all.length - 1

    if (!isLast) {
      return sum as T
    }

    return fn(all)
  }

export const constant = <T>(value: T): (() => T) => () => value

export const identity = <T>(x: T): T => x

export const toIndexedObject = <T, V, R extends { [key: string]: V }>(
  fn: (item: T, index: number) => [string, V],
) => (sum: R, item: T, index: number): R => {
  const [key, value] = fn(item, index)
  return ((sum as { [key: string]: V })[key] = value), sum
}

export const mapToIndexedObject = <T, V, R extends { [key: string]: V }>(
  fn: (item: T, index: number) => [string, V],
  items: T[],
  initial: R = {} as R,
): R => items.reduce(toIndexedObject<T, V, R>(fn), initial)

export const pairsToIndexedObject = <V, R extends { [key: string]: V }>(
  sum: R,
  [key, value]: [string, V],
): R => (((sum as { [key: string]: V })[key] = value), sum)
