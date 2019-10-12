import { fromPromise } from "../Task";
import { ERROR_RESULT, SUCCESS_RESULT } from "./util";

describe("fromPromise", () => {
  test("should succeed when a promise succeeds", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    const promise = Promise.resolve(SUCCESS_RESULT);

    fromPromise(promise).fork(reject, resolve);

    await promise.catch(() => void 0);

    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
    expect(reject).not.toBeCalled();
  });

  test("should fail when a promise fails", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    const promise = Promise.reject(ERROR_RESULT);

    fromPromise(promise).fork(reject, resolve);

    await promise.catch(() => void 0);

    expect(reject).toBeCalledWith(ERROR_RESULT);
    expect(resolve).not.toBeCalled();
  });
});
