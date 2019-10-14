import { fail, succeed, Task } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("andThen", () => {
  test("should succeed when chaining on a successful task", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(5)
      .andThen(r => succeed(r * 2))
      .fork(reject, resolve);

    expect(resolve).toBeCalledWith(10);
    expect(reject).not.toBeCalled();
  });

  test("should fail when chaining on a failed task", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    fail(ERROR_RESULT)
      .andThen(_ => succeed(true))
      .fork(reject, resolve);

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith(ERROR_RESULT);
  });

  test("should call computation once per andThen", () => {
    const onFork = jest.fn();

    const task = new Task(() => {
      onFork();
    });

    task
      .andThen(() => succeed(SUCCESS_RESULT))
      .fork(() => void 0, () => void 0);

    task
      .andThen(() => succeed(SUCCESS_RESULT))
      .fork(() => void 0, () => void 0);

    expect(onFork).toBeCalledTimes(2);
  });

  test("should call computation once when nesting", () => {
    const onFork = jest.fn();

    const task = new Task(() => {
      onFork();
    });

    task
      .andThen(() => succeed(SUCCESS_RESULT))
      .andThen(() => succeed(SUCCESS_RESULT))
      .fork(() => void 0, () => void 0);

    expect(onFork).toBeCalledTimes(1);
  });
});
