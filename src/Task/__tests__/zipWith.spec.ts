import { failIn, succeed, succeedIn, zipWith } from "../Task";
import { ERROR_RESULT } from "./util";

describe("zip", () => {
  test("should run both tasks in parallel and return a tuple of results in their original order", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    zipWith((a, b) => a + b, succeedIn(200, "A"), succeedIn(100, "B")).fork(
      reject,
      resolve
    );

    jest.advanceTimersByTime(250);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith("AB");
  });

  test("should fail on first error", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    zipWith(
      (a, b) => a + b,
      failIn(200, ERROR_RESULT),
      succeedIn(100, "B")
    ).fork(reject, resolve);

    jest.advanceTimersByTime(250);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });

  test("should work on an a mix of tasks and promises", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    zipWith((a, b) => a + b, succeed("A"), Promise.resolve("B")).fork(
      reject,
      resolve
    );

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith("AB");
  });

  test("should work on entirely promises", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    zipWith((a, b) => a + b, Promise.resolve("A"), Promise.resolve("B")).fork(
      reject,
      resolve
    );

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith("AB");
  });

  test("should fail on first promise error", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    zipWith((a, b) => a + b, Promise.reject(ERROR_RESULT), succeed("B")).fork(
      reject,
      resolve
    );

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
