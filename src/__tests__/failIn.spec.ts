import { failIn } from "../Task";
import { ERROR_RESULT } from "./util";

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
