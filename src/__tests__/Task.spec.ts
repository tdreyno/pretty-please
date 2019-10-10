import {
  all,
  apply,
  chain,
  fail,
  failIn,
  firstSuccess,
  fold,
  fork,
  fromPromise,
  map,
  mapBoth,
  mapError,
  never,
  orElse,
  race,
  sequence,
  succeed,
  succeedIn,
  swap,
  Task,
  toPromise
} from "../Task";

jest.useFakeTimers();

// function succeedIn<S>(resolve: Resolve<S>, result: S, ms: number) {
//   return setTimeout(() => resolve(result), ms);
// }

describe("Task", () => {
  const SUCCESS_RESULT = "__SUCCESS__";
  const ERROR_RESULT = "__ERROR__";

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

      fork(reject, resolve, succeed(SUCCESS_RESULT));

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("should call reject on failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, fail(ERROR_RESULT));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("chain", () => {
    test("should succeed when chaining on a successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, chain(r => succeed(r * 2), succeed(5)));

      expect(resolve).toBeCalledWith(10);
      expect(reject).not.toBeCalled();
    });

    test("should fail when chaining on a failed task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, chain(_ => succeed(true), fail(ERROR_RESULT)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("fromPromise", () => {
    test("should succeed when a promise succeeds", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const promise = Promise.resolve(SUCCESS_RESULT);

      fork(reject, resolve, fromPromise(promise));

      await promise.catch(() => void 0);

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("should fail when a promise fails", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const promise = Promise.reject(ERROR_RESULT);

      fork(reject, resolve, fromPromise(promise));

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
      const promise = toPromise(task).then(resolve, reject);

      fork(() => void 0, () => void 0, task);

      await promise.catch(() => void 0);

      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
      expect(reject).not.toBeCalled();
    });

    test("promise should reject when the task fails", async () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const task = fail(ERROR_RESULT);
      const promise = toPromise(task).then(resolve, reject);

      fork(() => void 0, () => void 0, task);

      await promise.catch(() => void 0);

      expect(reject).toBeCalledWith(ERROR_RESULT);
      expect(resolve).not.toBeCalled();
    });
  });

  describe("race", () => {
    test("should resolve when the first response is successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(
        reject,
        resolve,
        race(succeedIn(100, SUCCESS_RESULT), failIn(200, ERROR_RESULT))
      );

      jest.advanceTimersByTime(150);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject when the first response is a failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(
        reject,
        resolve,
        race(succeedIn(200, SUCCESS_RESULT), failIn(100, ERROR_RESULT))
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

      fork(
        reject,
        resolve,
        firstSuccess(succeedIn(200, SUCCESS_RESULT), failIn(100, ERROR_RESULT))
      );

      jest.advanceTimersByTime(250);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });

    test("should reject when the no responses are successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(
        reject,
        resolve,
        firstSuccess(failIn(200, ERROR_RESULT), failIn(100, ERROR_RESULT))
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

      fork(reject, resolve, all(succeedIn(200, "A"), succeedIn(100, "B")));

      jest.advanceTimersByTime(250);

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(["A", "B"]);
    });

    test("should fail on first error", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(
        reject,
        resolve,
        all(failIn(200, ERROR_RESULT), succeedIn(100, "B"))
      );

      jest.advanceTimersByTime(250);

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("sequence", () => {
    test("should run all taks in sequence and return an array of results in their original order", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, sequence(succeedIn(100, "A"), succeedIn(100, "B")));

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

      fork(
        reject,
        resolve,
        sequence(succeedIn(100, "B"), failIn(100, ERROR_RESULT))
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

      fork(reject, resolve, swap(succeed(ERROR_RESULT)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });

    test("should swap errors to successes", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, swap(fail(SUCCESS_RESULT)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("map", () => {
    test("should map successfuly results into new data", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, map(r => r * 2, succeed(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should still fail when mapping failed task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, map(r => r * 2, fail(ERROR_RESULT)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });

  describe("mapError", () => {
    test("should map failed tasks new error data", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, mapError(r => r * 2, fail(5)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(10);
    });

    test("should still succeed when error mapping successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, mapError(r => r * 2, succeed(SUCCESS_RESULT)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    });
  });

  describe("mapBoth", () => {
    test("should map success on successful tasks", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, mapBoth(r => r ** 2, r => r * 2, succeed(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should still succeed when error mapping successful task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, mapBoth(r => r ** 2, r => r * 2, fail(5)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(25);
    });
  });

  describe("fold", () => {
    test("should map successes to new result", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, fold(r => r ** 2, r => r * 2, succeed(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should map failures to new result", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, fold(r => r ** 2, r => r * 2, fail(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(25);
    });
  });

  describe("orElse", () => {
    test("should succeed with original result if successful", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, orElse(r => succeed(r ** 2), succeed(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(5);
    });

    test("should succeed with else result if a failure", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      fork(reject, resolve, orElse(r => succeed(r ** 2), fail(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(25);
    });
  });

  describe("apply", () => {
    test("should apply converter function result to finished task", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const doubler = (r: number) => r * 2;

      fork(reject, resolve, apply(succeed(doubler), succeed(5)));

      expect(reject).not.toBeCalled();
      expect(resolve).toBeCalledWith(10);
    });

    test("should return original error when the original task fails", () => {
      const resolve = jest.fn();
      const reject = jest.fn();

      const doubler = (r: number) => r * 2;

      fork(reject, resolve, apply(succeed(doubler), fail(ERROR_RESULT)));

      expect(resolve).not.toBeCalled();
      expect(reject).toBeCalledWith(ERROR_RESULT);
    });
  });
});
