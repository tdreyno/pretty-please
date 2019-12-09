import { all, failIn, succeed, succeedIn } from "../Task";
import { ERROR_RESULT } from "./util";

describe("all", () => {
  test("should run all taks in parallel and return an array of results in their original order", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    all([succeedIn(200, "A"), succeedIn(100, "B")]).fork(reject, resolve);

    jest.advanceTimersByTime(250);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });

  test("should fail on first error", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    all([failIn(200, ERROR_RESULT), succeedIn(100, "B")]).fork(reject, resolve);

    jest.advanceTimersByTime(250);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });

  test("should work on an array mixing tasks and promises", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    all([succeed("A"), Promise.resolve("B")]).fork(reject, resolve);

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });

  test("should work on an array entirely of promises", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    all([Promise.resolve("A"), Promise.resolve("B")]).fork(reject, resolve);

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });

  test("should fail on first promise error", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    all([Promise.reject(ERROR_RESULT), succeed("B")]).fork(reject, resolve);

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
