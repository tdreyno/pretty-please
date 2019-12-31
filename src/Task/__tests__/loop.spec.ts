import { fail, loop, LoopBreak, LoopContinue, of } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("loop", () => {
  test("should run 3 times", () => {
    const counter = jest.fn();
    const resolve = jest.fn();
    const reject = jest.fn();

    loop(currentValue => {
      if (currentValue === 0) {
        return of(new LoopBreak(SUCCESS_RESULT));
      }

      counter();

      return of(new LoopContinue(currentValue - 1));
    }, 3).fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(counter).toHaveBeenCalledTimes(3);
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });

  test("should error on the 2nd time", () => {
    const counter = jest.fn();
    const resolve = jest.fn();
    const reject = jest.fn();

    loop(currentValue => {
      if (currentValue === 0) {
        return of(new LoopBreak(SUCCESS_RESULT));
      }

      if (currentValue === 2) {
        return fail(ERROR_RESULT);
      }

      counter();

      return of(new LoopContinue(currentValue - 1));
    }, 3).fork(reject, resolve);

    expect(resolve).not.toBeCalled();
    expect(counter).toHaveBeenCalledTimes(1);
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
