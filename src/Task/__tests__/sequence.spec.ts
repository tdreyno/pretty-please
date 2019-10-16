import { failIn, sequence, succeedIn } from "../Task";
import { ERROR_RESULT } from "./util";

describe("sequence", () => {
  test("should run all taks in sequence and return an array of results in their original order", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    sequence([succeedIn(100, "A"), succeedIn(100, "B")]).fork(reject, resolve);

    jest.advanceTimersByTime(100);

    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(100);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });

  test("should fail on first error", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    sequence([succeedIn(100, "B"), failIn(100, ERROR_RESULT)]).fork(
      reject,
      resolve
    );

    jest.advanceTimersByTime(100);

    expect(reject).not.toBeCalled();
    expect(resolve).not.toBeCalled();

    jest.advanceTimersByTime(100);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });
});
