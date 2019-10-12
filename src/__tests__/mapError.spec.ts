import { fail, succeed } from "../Task";
import { SUCCESS_RESULT } from "./util";

describe("mapError", () => {
  test("should map failed tasks new error data", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    fail(5)
      .mapError(r => r * 2)
      .fork(reject, resolve);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(10);
  });

  test("should still succeed when error mapping successful task", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(SUCCESS_RESULT)
      .mapError(r => r * 2)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });
});
