export interface Initialized {
  type: "Initialized"
}

export interface Pending {
  type: "Pending"
}

export interface Failure<E> {
  type: "Failure"
  error: E
}

export interface Success<S> {
  type: "Success"
  result: S
}

export type RemoteData<E, S> = Initialized | Pending | Failure<E> | Success<S>

export const initialize = <E, S>(): RemoteData<E, S> => ({
  type: "Initialized"
})

export const pending = <E, S>(): RemoteData<E, S> => ({ type: "Pending" })

export const succeed = <S>(result: S): RemoteData<never, S> => ({
  type: "Success",
  result
})

export const fail = <E>(error: E): RemoteData<E, never> => ({
  type: "Failure",
  error
})

export const fold = <E, S, R>(
  onInitialized: () => R,
  onPending: () => R,
  onFailure: (error: E) => R,
  onSuccess: (result: S) => R,
  remote: RemoteData<E, S>
): R => {
  switch (remote.type) {
    case "Initialized":
      return onInitialized()

    case "Pending":
      return onPending()

    case "Failure":
      return onFailure(remote.error)

    case "Success":
      return onSuccess(remote.result)
  }
}
