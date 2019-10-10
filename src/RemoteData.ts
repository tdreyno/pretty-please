interface Initialized {
  state: "Initialized";
}

interface Pending {
  state: "Pending";
}

interface Failure<E> {
  state: "Failure";
  result: E;
}

interface Success<S> {
  state: "Success";
  result: S;
}

export type RemoteData<E, S> = Initialized | Pending | Failure<E> | Success<S>;

export function succeed<S, E = never>(result: S): RemoteData<E, S> {
  return {
    state: "Success",
    result
  };
}

export function isInitialized<E, S>(
  remote: RemoteData<E, S>
): remote is Initialized {
  return remote.state === "Initialized";
}

export function isPending<E, S>(remote: RemoteData<E, S>): remote is Pending {
  return remote.state === "Pending";
}

export function isFailure<E, S>(
  remote: RemoteData<E, S>
): remote is Failure<E> {
  return remote.state === "Failure";
}

export function isSuccess<E, S>(
  remote: RemoteData<E, S>
): remote is Success<S> {
  return remote.state === "Success";
}
