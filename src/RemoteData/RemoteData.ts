import { of, Task } from "../Task/Task";

export interface Initialized {
  type: "Initialized";
}

export interface Pending {
  type: "Pending";
}

export interface Failure<E> {
  type: "Failure";
  error: E;
}

export interface Success<S> {
  type: "Success";
  result: S;
}

export type RemoteData<E, S> = Initialized | Pending | Failure<E> | Success<S>;

export function initialize<E, S>(): RemoteData<E, S> {
  return { type: "Initialized" };
}

export function pending<E, S>(): RemoteData<E, S> {
  return { type: "Pending" };
}

export function succeed<S>(result: S): RemoteData<never, S> {
  return { type: "Success", result };
}

export function fail<E>(error: E): RemoteData<E, never> {
  return { type: "Failure", error };
}

export function fold<E, S, R>(
  onInitialized: () => R,
  onPending: () => R,
  onFailure: (error: E) => R,
  onSuccess: (result: S) => R,
  remote: RemoteData<E, S>
): R {
  switch (remote.type) {
    case "Initialized":
      return onInitialized();

    case "Pending":
      return onPending();

    case "Failure":
      return onFailure(remote.error);

    case "Success":
      return onSuccess(remote.result);
  }
}

export function fromTask<E, S>(
  task: Task<E, S>
): Task<unknown, RemoteData<E, S>> {
  return task.map(succeed).orElse(e => of(fail(e)));
}
