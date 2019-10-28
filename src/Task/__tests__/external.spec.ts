import { external } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("external", () => {
  test("should fail when external control has failed", () => {
    jest.useFakeTimers();

    const task = external();

    setTimeout(() => {
      task.reject(ERROR_RESULT);
    }, 100);

    task.fork(error => {
      expect(error).toBe(ERROR_RESULT);
    }, jest.fn());

    jest.runAllTimers();
  });

  test("should succeed when external control has succeeded", () => {
    jest.useFakeTimers();

    const task = external();

    setTimeout(() => {
      task.resolve(SUCCESS_RESULT);
    }, 100);

    task.fork(jest.fn(), result => {
      expect(result).toBe(SUCCESS_RESULT);
    });

    jest.runAllTimers();
  });

  test("should wait when until something happens", () => {
    const task = external();

    const reject = jest.fn();
    const resolve = jest.fn();

    task.fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();
  });

  test("should provide a stream of results", () => {
    jest.useFakeTimers();

    const task = external();

    setTimeout(() => {
      task.resolve(SUCCESS_RESULT);
    }, 100);

    setTimeout(() => {
      task.reject(ERROR_RESULT);
    }, 200);

    const reject = jest.fn();
    const resolve = jest.fn();

    task.fork(
      error => {
        reject(error);
        expect(error).toBe(ERROR_RESULT);
      },
      result => {
        resolve(result);
        expect(result).toBe(SUCCESS_RESULT);
      }
    );

    expect(reject).not.toHaveBeenCalled();
    expect(resolve).not.toHaveBeenCalled();

    jest.advanceTimersByTime(100);

    expect(reject).not.toHaveBeenCalled();
    expect(resolve).toHaveBeenCalledWith(SUCCESS_RESULT);

    jest.advanceTimersByTime(100);

    expect(reject).toHaveBeenCalledWith(ERROR_RESULT);
  });
});
