import { useCallback, useState } from "react";
import {
  fold,
  initialize,
  pending,
  RemoteData,
  succeed
} from "../RemoteData/RemoteData";
import { Task } from "../Task/Task";

export function useRemoteData<E, S>(task: () => Task<E, S>) {
  const [state, setState] = useState<RemoteData<E, S>>(initialize<E, S>());

  const request = useCallback(() => {
    if (state.type !== "Initialized") {
      return;
    }

    setState(pending<E, S>());

    task()
      .mapBoth(fail, succeed)
      .fork(setState, setState);
  }, [state, setState]);

  const caseof = useCallback(
    <R>(
      onInitialized: () => R,
      onPending: () => R,
      onFailure: (error: E) => R,
      onSuccess: (result: S) => R
    ): R => {
      return fold<E, S, R>(
        onInitialized,
        onPending,
        onFailure,
        onSuccess,
        state
      );
    },
    [state]
  );

  return [state, caseof, request];
}
