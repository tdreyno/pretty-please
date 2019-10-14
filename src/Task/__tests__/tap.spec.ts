import { fail, succeed } from "../Task";
import { ERROR_RESULT } from "./util";

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
