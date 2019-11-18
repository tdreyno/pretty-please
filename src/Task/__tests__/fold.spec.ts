import { fail, succeed } from "../Task";

describe("fold", () => {
  test("should map successes to new result", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(5)
      .fold(
        r => r ** 2,
        r => r * 2
      )
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(10);
  });

  test("should map failures to new result", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    fail(5)
      .fold(
        r => r ** 2,
        r => r * 2
      )
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(25);
  });
});
