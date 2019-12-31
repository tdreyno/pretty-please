import { range } from "../../util";
import { of, reduce } from "../Task";

describe("reduce", () => {
  test("should calculate 3!", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    reduce((sum, value) => of(sum * (value + 1)), 1, range(3)).fork(
      reject,
      resolve
    );

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(6);
  });
});
