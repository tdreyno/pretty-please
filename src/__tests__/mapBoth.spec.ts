import { fail, succeed } from "../Task";

describe("mapBoth", () => {
  test("should map success on successful tasks", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(5)
      .mapBoth(r => r ** 2, r => r * 2)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(10);
  });

  test("should still succeed when error mapping successful task", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    fail(5)
      .mapBoth(r => r ** 2, r => r * 2)
      .fork(reject, resolve);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(25);
  });
});
