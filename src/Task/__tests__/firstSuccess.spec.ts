import { failIn, firstSuccess, succeedIn } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("firstSuccess", () => {
  test("should resolve when the first response is successful", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    firstSuccess([
      succeedIn(200, SUCCESS_RESULT),
      failIn(100, ERROR_RESULT)
    ]).fork(reject, resolve);

    jest.advanceTimersByTime(250);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });

  test("should reject when the no responses are successful", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    firstSuccess([failIn(200, ERROR_RESULT), failIn(100, ERROR_RESULT)]).fork(
      reject,
      resolve
    );

    jest.advanceTimersByTime(250);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith([ERROR_RESULT, ERROR_RESULT]);
  });
});
