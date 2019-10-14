import { fail, succeed } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("retryWithExponentialBackoff", () => {
  test("should resolve immediately on success", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(SUCCESS_RESULT)
      .retryWithExponentialBackoff(10, 4)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });

  test("should retry every X * 2 ^ N milliseconds on failure", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    const response = jest
      .fn()
      .mockReturnValueOnce(fail(ERROR_RESULT))
      .mockReturnValueOnce(fail(ERROR_RESULT))
      .mockReturnValueOnce(fail(ERROR_RESULT))
      .mockReturnValueOnce(fail(ERROR_RESULT))
      .mockReturnValueOnce(succeed(SUCCESS_RESULT));

    const attempts = 4;

    succeed(true)
      .andThen(response)
      .retryWithExponentialBackoff(10, attempts)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(10);
    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(10);
    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(20);
    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(40);
    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });

  test("should fail eventually immediately on successive failure", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    fail(ERROR_RESULT)
      .retryWithExponentialBackoff(10, 4)
      .fork(reject, resolve);

    jest.runAllTimers();

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
