import { ok } from "assert";

// tslint:disable: max-classes-per-file

abstract class Result<E, S> {
  public type: "Ok" | "Err";

  public map<S2>(fn: (result: S) => S2) {
    return map(fn, this);
  }

  public mapError<E2>(fn: (result: E) => E2) {
    return mapError(fn, this);
  }

  public andThen<S2>(fn: (result: S) => Result<E, S2>) {
    return andThen(fn, this);
  }

  public withDefault(defaultValue: S) {
    return withDefault(defaultValue, this);
  }

  public fold<R>(errHandler: (error: E) => R, okHandler: (result: S) => R) {
    return fold(errHandler, okHandler, this);
  }
}

export class Ok<S, E = never> extends Result<E, S> {
  public type: "Ok" = "Ok";

  constructor(public result: S) {
    super();
  }
}

export class Err<E, S = never> extends Result<E, S> {
  public type: "Err" = "Err";

  constructor(public error: E) {
    super();
  }
}

export function isOk<E, S>(result: Result<E, S>): result is Ok<S, E> {
  return result.type === "Ok";
}

export function isErr<E, S>(result: Result<E, S>): result is Err<E, S> {
  return result.type === "Err";
}

export function map<E, S, S2>(
  fn: (result: S) => S2,
  result: Result<E, S>
): Result<E, S> | Result<E, S2> {
  return isOk(result) ? new Ok<S2, E>(fn(result.result)) : result;
}

export function mapError<E, S, E2>(
  fn: (error: E) => E2,
  result: Result<E, S>
): Result<E, S> | Result<E2, S> {
  return isErr(result) ? new Err<E2, S>(fn(result.error)) : result;
}

export function andThen<E, S, S2>(
  fn: (result: S) => Result<E, S2>,
  result: Result<E, S>
): Result<E, S> | Result<E, S2> {
  return isOk(result) ? fn(result.result) : result;
}

export function withDefault<E, S>(defaultValue: S, result: Result<E, S>): S {
  return isOk(result) ? result.result : defaultValue;
}

export function fold<E, S, R>(
  errHandler: (error: E) => R,
  okHandler: (result: S) => R,
  result: Result<E, S>
): R {
  if (isOk(result)) {
    return okHandler(result.result);
  } else if (isErr(result)) {
    return errHandler(result.error);
  }
}
