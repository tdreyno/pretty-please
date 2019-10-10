export type Reject<E> = (error: E) => void;
export type Resolve<S> = (result: S) => void;
export type Fork<E, S> = (reject: Reject<E>, resolve: Resolve<S>) => void;

export interface Task<E, S> {
  readonly fork: Fork<E, S>;
}

/**
 * Create a new task.
 * @param computation A function which will be run when the task starts.
 */
export function Task<E, S>(computation: Fork<E, S>): Task<E, S> {
  return {
    fork: computation
  };
}

/**
 * Creates a Task which has already successfully completed with `result`.
 * @param result The value to place into the successful Task.
 */
export function succeed<T, E = never>(result: T): Task<E, T> {
  return Task((_, resolve) => resolve(result));
}

/**
 * Creates a Task which automatically succeeds at some time in the future with `result`.
 * @param ms How many milliseconds until it succeeds.
 * @param result The value to place into the successful Task.
 */
export function succeedIn<T, E = never>(ms: number, result: T): Task<E, T> {
  return Task((_, resolve) => setTimeout(() => resolve(result), ms));
}

/**
 * Creates a Task which has already failed with `error`.
 * @param error The error to place into the failed Task.
 */
export function fail<T>(error: T): Task<T, never> {
  return Task((reject, _) => reject(error));
}

/**
 * Creates a Task which automatically fails at some time in the future with `error`.
 *  @param ms How many milliseconds until it succeeds.
 * @param error The error to place into the failed Task.
 */
export function failIn<T>(ms: number, error: T): Task<T, never> {
  return Task((reject, _) => setTimeout(() => reject(error), ms));
}

/**
 * Creates a Task will never finish.
 */
export function never(): Task<never, never> {
  return Task(() => void 0);
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
 * @param fn Takes a successful result and returns a new task.
 * @param task The task which will chain to the next one on success.
 */
export function chain<E, S, S2>(
  fn: (result: S) => Task<E, S2>,
  task: Task<E, S>
): Task<E, S2> {
  return Task((reject, resolve) =>
    fork(reject, b => fork(reject, resolve, fn(b)), task)
  );
}

/**
 * Given a promise, create a Task which relies on it.
 * @param promise The promise we will gather the success from.
 */
export function fromPromise<S>(promise: Promise<S>): Task<unknown, S> {
  return Task((reject, resolve) => promise.then(resolve, reject));
}

/**
 * Given a task, create a Promise which resolves when the task does.
 * @param task The task we will convert to a promise.
 */
export function toPromise<E, S>(task: Task<E, S>): Promise<S> {
  return new Promise((resolve, reject) => fork(reject, resolve, task));
}

/**
 * Given an array of tasks, return the one which finishes first.
 * @param tasks The tasks to run in parallel.
 */
export function race<E, S>(...tasks: Array<Task<E, S>>): Task<E, S> {
  return Task<E, S>((reject, resolve) => {
    let done = false;

    return tasks.map(task =>
      fork(
        (error: E) => {
          if (done) {
            return;
          }

          done = true;
          reject(error);
        },
        (result: S) => {
          if (done) {
            return;
          }

          done = true;
          resolve(result);
        },
        task
      )
    );
  });
}

/**
 * Given an array of tasks, return the one which finishes successfully first.
 * @param tasks The tasks to run in parallel.
 */
export function firstSuccess<E, S>(...tasks: Array<Task<E, S>>): Task<E[], S> {
  return Task<E[], S>((reject, resolve) => {
    let isDone = false;
    let runningTasks = tasks.length;

    const errors: E[] = [];

    return tasks.map(task =>
      fork(
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
        },
        task
      )
    );
  });
}

/**
 * Given an array of task which return a result, return a new task which results an array of results.
 * @param tasks The tasks to run in parallel.
 */
export function all<E, S>(...tasks: Array<Task<E, S>>): Task<E, S[]> {
  return Task<E, S[]>((reject, resolve) => {
    let isDone = false;
    let runningTasks = tasks.length;

    const results: S[] = [];

    return tasks.map((task, i) =>
      fork(
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
        },
        task
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
    return chain(list => {
      return map(result => [...list, result], task);
    }, sum);
  }, succeed([] as S[]));
}

/**
 * Given a task, swap the error and success values.
 * @param task The task to swap the results of.
 */
export function swap<E, S>(task: Task<E, S>): Task<S, E> {
  return Task<S, E>((reject, resolve) => fork(resolve, reject, task));
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
  return Task<E, S2>((reject, resolve) =>
    fork(reject, result => resolve(fn(result)), task)
  );
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
  return Task<E2, S>((reject, resolve) =>
    fork(error => reject(fn(error)), resolve, task)
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
  return Task<never, R>((_, resolve) =>
    fork(
      error => resolve(handleError(error)),
      result => resolve(handleSuccess(result)),
      task
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
  return Task<E, S>((reject, resolve) =>
    fork(error => fork(reject, resolve, fn(error)), resolve, task)
  );
}

/**
 * Given a task that succeeds with a map function as its result,
 * run that function over the result of a second successful Task.
 * @param appliedTask The task whose value will be passed to the map function.
 * @param task The task who will return a map function as the success result.
 */
export function apply<E, S, S2>(
  task: Task<E, (result: S) => S2>,
  appliedTask: Task<E, S>
): Task<E, S2> {
  return Task((reject, resolve) => {
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

    fork(
      handleReject,
      handleResolve((x: (result: S) => S2) => {
        applierFunction = x;
      }),
      task
    );

    fork(
      handleReject,
      handleResolve<S>((x: S) => {
        hasResultLoaded = true;
        targetResult = x;
      }),
      appliedTask
    );
  });
}
