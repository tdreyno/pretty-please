interface Object {
  andThen: <T, U>(this: T, fn: (data: T) => U) => U;
}

Object.prototype.andThen = function<T, U>(this: T, fn: (data: T) => U): U {
  return fn(this);
};
