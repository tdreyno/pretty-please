import { fail, succeed } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

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
      .chain(response)
      .retryIn(100)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersToNextTimer();

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });
});
