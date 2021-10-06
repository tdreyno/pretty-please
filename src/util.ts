export const range = (end: number, start = 0): number[] =>
  Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i)

export const to =
  <A, T>(fn: (items: A[]) => T) =>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/explicit-module-boundary-types
  (sum: any, _item: A, index: number, all: A[]): T => {
    const isLast = index === all.length - 1

    if (!isLast) {
      return sum as T
    }

    return fn(all)
  }

export const constant =
  <T>(value: T): (() => T) =>
  () =>
    value

export const identity = <T>(x: T): T => x

export const toIndexedObject =
  <T, V, R extends { [key: string]: V }>(
    fn: (item: T, index: number) => [string, V],
  ) =>
  (sum: R, item: T, index: number): R => {
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

declare global {
  interface Array<T> {
    chain_<U>(fn: (arr: Array<T>) => U): U
  }
}

Array.prototype.chain_ = function <T, U>(
  this: Array<T>,
  fn: (arr: Array<T>) => U,
): U {
  return fn(this)
}

export type Validation<E, S> =
  | { success: true; value: S }
  | { success: false; error: E }

export const successfulValidation = <S>(value: S): Validation<never, S> => ({
  success: true,
  value,
})

export const failedValidation = <E>(error: E): Validation<E, never> => ({
  success: false,
  error,
})

export const take = <T>(count: number, arr: Array<T>): Array<T> =>
  !isFinite(count) ? [...arr] : arr.slice(0, count)

export const drop = <T>(count: number, arr: Array<T>): Array<T> =>
  !isFinite(count) ? [] : arr.splice(count)
