export function always<T>(x: T) {
  return () => x;
}

export function identity<T>(x: T): T {
  return x;
}
