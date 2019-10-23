import "../extend";
import { all, of } from "../Task/Task";

describe("to", () => {
  test("should work with reduce to wrap a value", () => {
    function sum(nums: number[]): number {
      return nums.reduce((acc, num) => acc + num, 0);
    }

    const result = [1, 2, 3].andThen(sum);

    expect(result).toBe(6);
  });

  test("should be able to convert to Task.all", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    ["A", "B"]
      .map(of)
      .andThen(all)
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });
});
