import { failIn, race, succeedIn } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("race", () => {
  test("should resolve when the first response is successful", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    race([succeedIn(100, SUCCESS_RESULT), failIn(200, ERROR_RESULT)]).fork(
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

    race([succeedIn(200, SUCCESS_RESULT), failIn(100, ERROR_RESULT)]).fork(
      reject,
      resolve
    );

    jest.advanceTimersByTime(150);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
