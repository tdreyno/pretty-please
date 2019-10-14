import { fail, succeed } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

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
