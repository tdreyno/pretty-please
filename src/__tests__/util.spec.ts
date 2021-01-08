import { all, of } from "../Task/Task"
import { mapToIndexedObject, range, to } from "../util"

describe("range", () => {
  test("should make an array of the correct range", () => {
    expect(range(5, 2)).toHaveLength(3)
  })

  test("should make an array of the correct range without and end", () => {
    expect(range(5)).toHaveLength(5)
  })
})

describe("to", () => {
  test("should work with reduce to wrap a value", () => {
    const add = (a: number, b: number) => a + b

    const sum = (nums: number[]): number => nums.reduce(add, 0)

    const result = [1, 2, 3].reduce(to(sum))

    expect(result).toBe(6)
  })

  test("should be able to convert to Task.all", () => {
    const resolve = jest.fn()
    const reject = jest.fn()
    ;["A", "B"]
      .map(of)
      .reduce(to(all), of([] as string[]))
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(["A", "B"])
  })
})

describe("mapToIndexedObject", () => {
  test("should map an array to an indexed object", () => {
    const result = mapToIndexedObject(
      (num, i) => [i.toString(), num],
      ["a", "b", "c"],
      {},
    )

    expect(result).toEqual({
      "0": "a",
      "1": "b",
      "2": "c",
    })
  })
})

describe("Array.prototype.chain_", () => {
  test("should allow Array chaining", () => {
    const sum = (arr: number[]) => arr.reduce((a, b) => a + b, 0)
    const result = [1, 2, 3].chain_(sum)

    expect(result).toEqual(6)
  })
})
