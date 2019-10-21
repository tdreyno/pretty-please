export function range(end: number, start: number = 0): number[] {
  return Array(end - start)
    .fill(undefined)
    .map((_, i) => start + i);
}
