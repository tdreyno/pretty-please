import { succeed } from "../Task";
import { SUCCESS_RESULT } from "./util";

describe("flatten", () => {
  test("should flatten a task of a task into a single task", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    succeed(succeed(SUCCESS_RESULT))
      .flatten()
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(SUCCESS_RESULT);
  });
});
