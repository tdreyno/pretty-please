export function always<T>(x: T) {
  return () => x;
}

export function identity<T>(x: T): T {
  return x;
}

export function range(end: number, start: number = 0): number[] {
  return Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i);
}
