import {
  all,
  fail,
  failIn,
  firstSuccess,
  fork,
  fromPromise,
  never,
  race,
  sequence,
  succeed,
  succeedIn,
  Task
} from "../Task";

jest.useFakeTimers();

describe("Task", () => {
  const SUCCESS_RESULT = "__SUCCESS__";
  const ERROR_RESULT = "__ERROR__";

  describe("fork", () => {
    test("should work the same as pipeline fork", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, succeed(SUCCESS_RESULT));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("succeed", () => {
    test("should resolve immediately with passed value", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(SUCCESS_RESULT).fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("succeedIn", () => {
    test("should resolve in the future with passed value", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeedIn(100, SUCCESS_RESULT).fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersByTime(100);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("fail", () => {
    test("should fail immediately with passed error", () => {
      const resolve = jest.fn();

      fail(ERROR_RESULT).fork(error => {
        expect(error).toBe(ERROR_RESULT);
      }, resolve);

      expect(resolve).not.toBeCalled();
    });
  });

  describe("failIn", () => {
    test("should resolve in the future with passed value", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      failIn(100, ERROR_RESULT).fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersByTime(100);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("never", () => {
    test("should never succeed or fail", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      never().fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).not.toBeCalled();
    });
  });

  describe("fork", () => {
    test("should call resolve on success", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(SUCCESS_RESULT).fork(reject, resolve);

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("should call reject on failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(ERROR_RESULT).fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });

    test("should call computation on each fork", () => {
      const onFork = jest.fn();

      const task = new Task(() => {
        onFork();
      });

      task.fork(() => void 0, () => void 0);
      task.fork(() => void 0, () => void 0);

      expect(onFork).toBeCalledTimes(2);
    });
  });

  describe("andThen", () => {
    test("should succeed when chaining on a successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(5)
        .andThen(r => succeed(r * 2))
        .fork(reject, resolve);

      expect(resolve).toBeCalledWith(10);
      expect(reject).not.toBeCalled();
    });

    test("should fail when chaining on a failed task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(ERROR_RESULT)
        .andThen(_ => succeed(true))
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });

    test("should call computation once per andThen", () => {
      const onFork = jest.fn();

      const task = new Task(() => {
        onFork();
      });

      task
        .andThen(() => succeed(SUCCESS_RESULT))
        .fork(() => void 0, () => void 0);

      task
        .andThen(() => succeed(SUCCESS_RESULT))
        .fork(() => void 0, () => void 0);

      expect(onFork).toBeCalledTimes(2);
    });

    test("should call computation once when nesting", () => {
      const onFork = jest.fn();

      const task = new Task(() => {
        onFork();
      });

      task
        .andThen(() => succeed(SUCCESS_RESULT))
        .andThen(() => succeed(SUCCESS_RESULT))
        .fork(() => void 0, () => void 0);

      expect(onFork).toBeCalledTimes(1);
    });
  });

  describe("succeedIf", () => {
    test("should succeed and skip earlier task executions when cache checking function succeeds", () => {
      const didRootExecute = jest.fn();
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = new Task<never, string>((_, rootResolve) => {
        didRootExecute();
        rootResolve(SUCCESS_RESULT);
      });

      task.succeedIf(() => "Intercept").fork(reject, resolve);

      expect(didRootExecute).not.toBeCalled();
      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith("Intercept");
    });

    test("should resolve like normal task when cache checking function fails", () => {
      const didRootExecute = jest.fn();
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = new Task<never, string>((_, rootResolve) => {
        didRootExecute();
        rootResolve(SUCCESS_RESULT);
      });

      task.succeedIf(() => undefined).fork(reject, resolve);

      expect(didRootExecute).toBeCalled();
      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject like normal task when cache checking function fails", () => {
      const didRootExecute = jest.fn();
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = new Task<string, never>((rootReject, _) => {
        didRootExecute();
        rootReject(ERROR_RESULT);
      });

      task.succeedIf(() => undefined).fork(reject, resolve);

      expect(didRootExecute).toBeCalled();
      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("onlyOnce", () => {
    test("should succeed and skip earlier task executions on second call", () => {
      const didRootExecute = jest.fn();
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = new Task<never, string>((_, rootResolve) => {
        didRootExecute();
        rootResolve(SUCCESS_RESULT);
      });

      const only = task.onlyOnce();

      // First time.
      only.fork(reject, resolve);

      expect(didRootExecute).toHaveBeenCalledTimes(1);
      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);

      // Second time.
      only.fork(reject, resolve);

      expect(didRootExecute).toHaveBeenCalledTimes(1);
      expect(reject).not.toBeCalled();
      expect(resolve).toHaveBeenCalledTimes(2);
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should fail and skip earlier task executions on second call", () => {
      const didRootExecute = jest.fn();
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = new Task<string, never>((rootReject, _) => {
        didRootExecute();
        rootReject(ERROR_RESULT);
      });

      const only = task.onlyOnce();

      // First time.
      only.fork(reject, resolve);

      expect(didRootExecute).toHaveBeenCalledTimes(1);
      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);

      // Second time.
      only.fork(reject, resolve);

      expect(didRootExecute).toHaveBeenCalledTimes(1);
      expect(resolve).not.toBeCalled();
      expect(reject).toHaveBeenCalledTimes(2);
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("fromPromise", () => {
    test("should succeed when a promise succeeds", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const promise = Promise.resolve(SUCCESS_RESULT);

      fromPromise(promise).fork(reject, resolve);

      await promise.catch(() => void 0);

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("should fail when a promise fails", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const promise = Promise.reject(ERROR_RESULT);

      fromPromise(promise).fork(reject, resolve);

      await promise.catch(() => void 0);

      expect(reject).toBeCalledWith(ERROR_RESULT);
      expect(resolve).not.toBeCalled();
    });
  });

  describe("toPromise", () => {
    test("promise should succeed when the task succeeds", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = succeed(SUCCESS_RESULT);
      const promise = task.toPromise().then(resolve, reject);

      task.fork(() => void 0, () => void 0);

      await promise.catch(() => void 0);

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("promise should reject when the task fails", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = fail(ERROR_RESULT);
      const promise = task.toPromise().then(resolve, reject);

      task.fork(() => void 0, () => void 0);

      await promise.catch(() => void 0);

      expect(reject).toBeCalledWith(ERROR_RESULT);
      expect(resolve).not.toBeCalled();
    });
  });

  describe("race", () => {
    test("should resolve when the first response is successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      race(succeedIn(100, SUCCESS_RESULT), failIn(200, ERROR_RESULT)).fork(
        reject,
        resolve
      );

      jest.advanceTimersByTime(150);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject when the first response is a failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      race(succeedIn(200, SUCCESS_RESULT), failIn(100, ERROR_RESULT)).fork(
        reject,
        resolve
      );

      jest.advanceTimersByTime(150);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("firstSuccess", () => {
    test("should resolve when the first response is successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      firstSuccess(
        succeedIn(200, SUCCESS_RESULT),
        failIn(100, ERROR_RESULT)
      ).fork(reject, resolve);

      jest.advanceTimersByTime(250);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject when the no responses are successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      firstSuccess(failIn(200, ERROR_RESULT), failIn(100, ERROR_RESULT)).fork(
        reject,
        resolve
      );

      jest.advanceTimersByTime(250);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith([ERROR_RESULT, ERROR_RESULT]);
    });
  });

  describe("all", () => {
    test("should run all taks in parallel and return an array of results in their original order", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      all(succeedIn(200, "A"), succeedIn(100, "B")).fork(reject, resolve);

      jest.advanceTimersByTime(250);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(["A", "B"]);
    });

    test("should fail on first error", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      all(failIn(200, ERROR_RESULT), succeedIn(100, "B")).fork(reject, resolve);

      jest.advanceTimersByTime(250);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("sequence", () => {
    test("should run all taks in sequence and return an array of results in their original order", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      sequence(succeedIn(100, "A"), succeedIn(100, "B")).fork(reject, resolve);

      jest.advanceTimersByTime(100);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersByTime(100);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(["A", "B"]);
    });

    test("should fail on first error", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      sequence(succeedIn(100, "B"), failIn(100, ERROR_RESULT)).fork(
        reject,
        resolve
      );

      jest.advanceTimersByTime(100);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersByTime(100);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("swap", () => {
    test("should swap successes to errors", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(ERROR_RESULT)
        .swap()
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });

    test("should swap errors to successes", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(SUCCESS_RESULT)
        .swap()
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("map", () => {
    test("should map successfuly results into new data", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(5)
        .map(r => r * 2)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should still fail when mapping failed task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(ERROR_RESULT)
        .map(r => r * 2)
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });

    test("should call computation once per map", () => {
      const onFork = jest.fn();

      const task = new Task(() => {
        onFork();
      });

      task.map(() => SUCCESS_RESULT).fork(() => void 0, () => void 0);
      task.map(() => SUCCESS_RESULT).fork(() => void 0, () => void 0);

      expect(onFork).toBeCalledTimes(2);
    });

    test("should call computation once when nesting", () => {
      const onFork = jest.fn();

      const task = new Task(() => {
        onFork();
      });

      task
        .map(() => SUCCESS_RESULT)
        .map(() => SUCCESS_RESULT)
        .fork(() => void 0, () => void 0);

      expect(onFork).toBeCalledTimes(1);
    });
  });

  describe("tap", () => {
    test("should call callback when given a success", () => {
      const resolve = jest.fn();
      const reject = jest.fn();
      const effect = jest.fn();

      succeed(5)
        .tap(effect)
        .fork(reject, resolve);

      expect(effect).toBeCalledWith(5);
      expect(resolve).toBeCalledWith(5);
    });

    test("should call not callback when given a failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();
      const effect = jest.fn();

      fail(ERROR_RESULT)
        .tap(effect)
        .fork(reject, resolve);

      expect(effect).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("mapError", () => {
    test("should map failed tasks new error data", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(5)
        .mapError(r => r * 2)
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(10);
    });

    test("should still succeed when error mapping successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(SUCCESS_RESULT)
        .mapError(r => r * 2)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("mapBoth", () => {
    test("should map success on successful tasks", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(5)
        .mapBoth(r => r ** 2, r => r * 2)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should still succeed when error mapping successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(5)
        .mapBoth(r => r ** 2, r => r * 2)
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(25);
    });
  });

  describe("fold", () => {
    test("should map successes to new result", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(5)
        .fold(r => r ** 2, r => r * 2)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should map failures to new result", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(5)
        .fold(r => r ** 2, r => r * 2)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(25);
    });
  });

  describe("orElse", () => {
    test("should succeed with original result if successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(5)
        .orElse(r => succeed(r ** 2))
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(5);
    });

    test("should succeed with else result if a failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(5)
        .orElse(r => succeed(r ** 2))
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(25);
    });
  });

  describe("ap", () => {
    test("should apply converter function result to finished task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const doubler = (r: number) => r * 2;

      succeed(doubler)
        .ap(succeed(5))
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should return original error when the original task fails", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const doubler = (r: number) => r * 2;

      succeed(doubler)
        .ap(fail(ERROR_RESULT))
        .fork(reject, resolve);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("wait", () => {
    test("should resolve in X ms on success", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(SUCCESS_RESULT)
        .wait(100)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersToNextTimer();

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject in X ms on failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fail(ERROR_RESULT)
        .wait(100)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersToNextTimer();

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("retryIn", () => {
    test("should resolve immediately on success", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      succeed(SUCCESS_RESULT)
        .retryIn(100)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should retry in X milliseconds on failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const response = jest
        .fn()
        .mockReturnValueOnce(fail(ERROR_RESULT))
        .mockReturnValueOnce(succeed(SUCCESS_RESULT));

      succeed(true)
        .andThen(response)
        .retryIn(100)
        .fork(reject, resolve);

      expect(reject).not.toBeCalled();
      expect(resolve).not.toBeCalled();

      jest.advanceTimersToNextTimer();

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });
});
