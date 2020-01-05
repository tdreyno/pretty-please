import { all, of, Task } from "../Task/Task";
import { range, to } from "../util";

describe("range", () => {
  test("should make an array of the correct range", () => {
    expect(range(5, 2)).toHaveLength(3);
  });

  test("should make an array of the correct range without and end", () => {
    expect(range(5)).toHaveLength(5);
  });
});

describe("to", () => {
  test("should work with reduce to wrap a value", () => {
    const add = (a: number, b: number) => a + b;

    function sum(nums: number[]): number {
      return nums.reduce(add, 0);
    }

    const result = [1, 2, 3].reduce(to(sum));

    expect(result).toBe(6);
  });

  test("should be able to convert to Task.all", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    ["A", "B"]
      .map(of)
      .reduce<Task<any, string[]>>(to(all), of([]))
      .fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith(["A", "B"]);
  });
});
