import { range } from "../util";

export type Reject<E> = (error: E) => void;
export type Resolve<S> = (result: S) => void;
export type Fork<E, S> = (reject: Reject<E>, resolve: Resolve<S>) => void;

/**
 * Create a new task.
 * @param computation A function which will be run when the task starts.
 */
export class Task<E, S> {
  public fork: Fork<E, S>;

  constructor(computation: Fork<E, S>) {
    this.fork = computation;
  }

  public andThen<S2>(fn: (result: S) => Task<E, S2>): Task<E, S2> {
    return andThen(fn, this);
  }

  public succeedIf(fn: () => S | undefined): Task<E, S> {
    return succeedIf(fn, this);
  }

  public onlyOnce(): Task<E, S> {
    return onlyOnce(this);
  }

  public toPromise(): Promise<S> {
    return toPromise(this);
  }

  public swap(): Task<S, E> {
    return swap(this);
  }

  public map<S2>(fn: (result: S) => S2): Task<E, S2> {
    return map(fn, this);
  }

  public tap(fn: (result: S) => void): Task<E, S> {
    return tap(fn, this);
  }

  public mapError<E2>(fn: (error: E) => E2): Task<E2, S> {
    return mapError(fn, this);
  }

  public mapBoth<E2, S2>(
    handleError: (error: E) => E2,
    handleSuccess: (success: S) => S2
  ): Task<E2, S2> {
    return mapBoth(handleError, handleSuccess, this);
  }

  public fold<R>(
    handleError: (error: E) => R,
    handleSuccess: (success: S) => R
  ): Task<never, R> {
    return fold(handleError, handleSuccess, this);
  }

  public orElse<S2>(fn: (error: E) => Task<E, S | S2>): Task<E, S | S2> {
    return orElse(fn, this);
  }

  public ap<E2, S2, S3 = S extends (arg: S2) => any ? ReturnType<S> : never>(
    task: Task<E | E2, S2>
  ): Task<E | E2, S3> {
    return ap((this as unknown) as Task<E, (result: S2) => S3>, task);
  }

  public wait(ms: number): Task<E, S> {
    return wait(ms, this);
  }

  public retryIn(ms: number): Task<E, S> {
    return retryIn(ms, this);
  }

  public retryWithExponentialBackoff(ms: number, times: number): Task<E, S> {
    return retryWithExponentialBackoff(ms, times, this);
  }
}

/**
 * Creates a Task which has already successfully completed with `result`.
 * @alias of
 * @param result The value to place into the successful Task.
 */
export function succeed<S, E = never>(result: S): Task<E, S> {
  return new Task((_, resolve) => resolve(result));
}

export const of = succeed;

/**
 * Creates a Task which automatically succeeds at some time in the future with `result`.
 * @param ms How many milliseconds until it succeeds.
 * @param result The value to place into the successful Task.
 */
export function succeedIn<S, E = never>(ms: number, result: S): Task<E, S> {
  return new Task((_, resolve) => setTimeout(() => resolve(result), ms));
}

/**
 * Creates a Task which has already failed with `error`.
 * @param error The error to place into the failed Task.
 */
export function fail<E, S = never>(error: E): Task<E, S> {
  return new Task((reject, _) => reject(error));
}

/**
 * Creates a Task which automatically fails at some time in the future with `error`.
 *  @param ms How many milliseconds until it succeeds.
 * @param error The error to place into the failed Task.
 */
export function failIn<E, S = never>(ms: number, error: E): Task<E, S> {
  return new Task((reject, _) => setTimeout(() => reject(error), ms));
}

/**
 * Creates a Task will never finish.
 */
export function never(): Task<never, never> {
  return new Task(() => void 0);
}

/**
 * Execute task computation and call handlers on completion.
 * @param reject Function to call on failure.
 * @param resolve Function to call on success.
 * @param task The task to fork.
 */
export function fork<E, S>(
  reject: Reject<E>,
  resolve: Resolve<S>,
  task: Task<E, S>
): void {
  return task.fork(reject, resolve);
}

/**
 * Chain a task to run after a previous task has succeeded.
 * @alias chain
 * @param fn Takes a successful result and returns a new task.
 * @param task The task which will chain to the next one on success.
 */
export function andThen<E, S, S2>(
  fn: (result: S) => Task<E, S2>,
  task: Task<E, S>
): Task<E, S2> {
  return new Task((reject, resolve) =>
    task.fork(reject, b => fn(b).fork(reject, resolve))
  );
}

export const chain = andThen;

/**
 * When forked, run a function which can check whether the task has already succeeded.
 * @param fn The function which either returns a success value or undefined.
 * @param task The task to run if the check fails (returns undefined).
 */
export function succeedIf<E, S>(
  fn: () => S | undefined,
  task: Task<E, S>
): Task<E, S> {
  return new Task((reject, resolve) => {
    const result = fn();

    if (result) {
      resolve(result);
      return;
    }

    task.fork(reject, resolve);
  });
}

/**
 * A task which only runs once. Caches the success or failure. Be careful.
 * @alias share
 * @param task The task to cache results.
 */
export function onlyOnce<E, S>(task: Task<E, S>): Task<E, S> {
  let state: "initialized" | "pending" | "success" | "failure" = "initialized";
  let cachedResult: S;
  let cachedError: E;

  let callbackId = 0;
  const callbacks: {
    [id: string]: { reject: Reject<E>; resolve: Resolve<S> };
  } = {};

  function notify(reject: Reject<E>, resolve: Resolve<S>) {
    const id = callbackId++;

    callbacks[id] = { reject, resolve };
  }

  function triggerReject(error: E) {
    state = "failure";
    cachedError = error;

    Object.keys(callbacks).forEach(id => {
      callbacks[id].reject(error);
      delete callbacks[id];
    });
  }

  function triggerResolve(result: S) {
    state = "success";
    cachedResult = result;

    Object.keys(callbacks).forEach(id => {
      callbacks[id].resolve(result);
      delete callbacks[id];
    });
  }

  return new Task((reject, resolve) => {
    switch (state) {
      case "success":
        resolve(cachedResult!);
        break;

      case "failure":
        reject(cachedError!);
        break;

      case "pending":
        notify(reject, resolve);
        break;

      case "initialized":
        state = "pending";

        notify(reject, resolve);

        task.fork(triggerReject, triggerResolve);
    }
  });
}

export const share = onlyOnce;

/**
 * Given a promise, create a Task which relies on it.
 * @param promise The promise we will gather the success from.
 */
export function fromPromise<S, E = unknown>(promise: Promise<S>): Task<E, S> {
  return new Task((reject, resolve) => promise.then(resolve, reject));
}

/**
 * Given a task, create a Promise which resolves when the task does.
 * @param task The task we will convert to a promise.
 */
export function toPromise<E, S>(task: Task<E, S>): Promise<S> {
  return new Promise((resolve, reject) => task.fork(reject, resolve));
}

/**
 * Given an array of tasks, return the one which finishes first.
 * @param tasks The tasks to run in parallel.
 */
export function race<E, S>(...tasks: Array<Task<E, S>>): Task<E, S> {
  return new Task<E, S>((reject, resolve) => {
    let done = false;

    return tasks.map(task =>
      task.fork(
        (error: E) => {
          /* istanbul ignore next */
          if (done) {
            return;
          }

          done = true;
          reject(error);
        },
        (result: S) => {
          /* istanbul ignore next */
          if (done) {
            return;
          }

          done = true;
          resolve(result);
        }
      )
    );
  });
}

/**
 * Given an array of tasks, return the one which finishes successfully first.
 * @param tasks The tasks to run in parallel.
 */
export function firstSuccess<E, S>(...tasks: Array<Task<E, S>>): Task<E[], S> {
  return new Task<E[], S>((reject, resolve) => {
    let isDone = false;
    let runningTasks = tasks.length;

    const errors: E[] = [];

    return tasks.map(task =>
      task.fork(
        (error: E) => {
          /* Should be impossible. */
          /* istanbul ignore next */
          if (isDone) {
            return;
          }

          runningTasks -= 1;

          errors.push(error);

          if (runningTasks === 0) {
            reject(errors);
          }
        },
        (result: S) => {
          /* Should be impossible. */
          /* istanbul ignore next */
          if (isDone) {
            return;
          }

          isDone = true;

          resolve(result);
        }
      )
    );
  });
}

/**
 * Given an array of task which return a result, return a new task which results an array of results.
 * @param tasks The tasks to run in parallel.
 */
export function all<E, S>(...tasks: Array<Task<E, S>>): Task<E, S[]> {
  return new Task<E, S[]>((reject, resolve) => {
    let isDone = false;
    let runningTasks = tasks.length;

    const results: S[] = [];

    return tasks.map((task, i) =>
      task.fork(
        (error: E) => {
          /* Should be impossible. */
          /* istanbul ignore next */
          if (isDone) {
            return;
          }

          isDone = true;

          reject(error);
        },
        (result: S) => {
          /* Should be impossible. */
          /* istanbul ignore next */
          if (isDone) {
            return;
          }

          runningTasks -= 1;

          results[i] = result;

          if (runningTasks === 0) {
            resolve(results);
          }
        }
      )
    );
  });
}

/**
 * Given an array of task which return a result, return a new task which results an array of results.
 * @param tasks The tasks to run in sequence.
 */
export function sequence<E, S>(...tasks: Array<Task<E, S>>): Task<E, S[]> {
  return tasks.reduce((sum, task) => {
    return andThen(list => {
      return map(result => [...list, result], task);
    }, sum);
  }, succeed([] as S[]));
}

/**
 * Given a task, swap the error and success values.
 * @param task The task to swap the results of.
 */
export function swap<E, S>(task: Task<E, S>): Task<S, E> {
  return new Task<S, E>((reject, resolve) => task.fork(resolve, reject));
}

/**
 * Given a task, map the successful value to a Task.
 * @param fn A function which takes the original successful result and returns the new one.
 * @param task The task to map the succcessful result.
 */
export function map<E, S, S2>(
  fn: (result: S) => S2,
  task: Task<E, S>
): Task<E, S2> {
  return new Task<E, S2>((reject, resolve) =>
    task.fork(reject, result => resolve(fn(result)))
  );
}

/**
 * Run a side-effect on success. Useful for logging.
 * @param fn A function will fire with the successful value.
 * @param task The task to tap on succcess.
 */
export function tap<E, S>(
  fn: (result: S) => void,
  task: Task<E, S>
): Task<E, S> {
  return map(result => {
    fn(result);

    return result;
  }, task);
}

/**
 * Given a task, map the failure error to a Task.
 * @param fn A function which takes the original failure error and returns the new one.
 * @param task The task to map the failure.
 */
export function mapError<E, S, E2>(
  fn: (error: E) => E2,
  task: Task<E, S>
): Task<E2, S> {
  return new Task<E2, S>((reject, resolve) =>
    task.fork(error => reject(fn(error)), resolve)
  );
}

/**
 * Given a task, map both the failure error and the success result to a Task.
 * @param handleError A function which takes the original failure error and returns the new one.
 * @param handleSuccess A function which takes the original successful result and returns the new one.
 * @param task The task to map the failure and succeess of.
 */
export function mapBoth<E, S, E2, S2>(
  handleError: (error: E) => E2,
  handleSuccess: (success: S) => S2,
  task: Task<E, S>
): Task<E2, S2> {
  return mapError(handleError, map(handleSuccess, task));
}

/**
 * Given a task, map both the failure error and the success result to a Task which always succeeds.
 * @param handleError A function which takes the original failure error and returns a successful result.
 * @param handleSuccess A function which takes the original successful result and returns a new successful result.
 * @param task The task to map failure and succeess to a success for.
 */
export function fold<E, S, R>(
  handleError: (error: E) => R,
  handleSuccess: (success: S) => R,
  task: Task<E, S>
): Task<never, R> {
  return new Task<never, R>((_, resolve) =>
    task.fork(
      error => resolve(handleError(error)),
      result => resolve(handleSuccess(result))
    )
  );
}

/**
 * Given a task, if the result in a failure, attemp to generate another Task from the error.
 * @param fn A function which takes the original failure error and returns a Task.
 * @param task The task to try to run a recovery function on failure.
 */
export function orElse<E, S>(
  fn: (error: E) => Task<E, S>,
  task: Task<E, S>
): Task<E, S> {
  return new Task<E, S>((reject, resolve) =>
    task.fork(error => fn(error).fork(reject, resolve), resolve)
  );
}

/**
 * Given a task that succeeds with a map function as its result,
 * run that function over the result of a second successful Task.
 * @param appliedTask The task whose value will be passed to the map function.
 * @param task The task who will return a map function as the success result.
 */
export function ap<E, S, S2>(
  task: Task<E, (result: S) => S2>,
  appliedTask: Task<E, S>
): Task<E, S2> {
  return new Task((reject, resolve) => {
    let targetResult: S;
    let applierFunction: ((result: S) => S2) | undefined;
    let hasResultLoaded = false;
    let isRejected = false;

    const handleResolve = <T>(onResolve: (result: T) => void) => {
      return (x: T) => {
        /* Should be impossible. */
        /* istanbul ignore next */
        if (isRejected) {
          return;
        }

        onResolve(x);

        if (applierFunction && hasResultLoaded) {
          resolve(applierFunction(targetResult));
        }
      };
    };

    const handleReject = (x: E) => {
      /* Should be impossible. */
      /* istanbul ignore next */
      if (isRejected) {
        return;
      }

      isRejected = true;
      reject(x);
    };

    task.fork(
      handleReject,
      handleResolve((x: (result: S) => S2) => {
        applierFunction = x;
      })
    );

    appliedTask.fork(
      handleReject,
      handleResolve<S>((x: S) => {
        hasResultLoaded = true;
        targetResult = x;
      })
    );
  });
}

/**
 * Wait some number of seconds to continue after a successful task.
 * @param ms How long to wait in milliseconds.
 * @param task Which task to wait to succeed with.
 */
export function wait<E, S>(ms: number, task: Task<E, S>): Task<E, S> {
  return new Task((reject, resolve) => {
    setTimeout(() => task.fork(reject, resolve), ms);
  });
}

/**
 * If a task fails, retry it in the future.
 * @param ms How long to wait before trying.
 * @param task Which task to retry.
 */
export function retryIn<E, S>(ms: number, task: Task<E, S>): Task<E, S> {
  return task.orElse(() => task.wait(ms));
}

/**
 * If a task fails, retry it X times, with exponential backoff.
 * @param ms How long to wait before trying the first time.
 * @param times How many times to attempt, each waiting 2x the previous time.
 * @param task Which task to retry.
 */
export function retryWithExponentialBackoff<E, S>(
  ms: number,
  times: number,
  task: Task<E, S>
): Task<E, S> {
  return range(times).reduce((sum, i) => sum.retryIn(ms * 2 ** i), task);
}
