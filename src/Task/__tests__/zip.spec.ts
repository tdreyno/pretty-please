import { failIn, succeedIn, zip } from "../Task"
import { ERROR_RESULT } from "./util"

describe("zip", () => {
  test("should run both tasks in parallel and return a tuple of results in their original order", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    zip(succeedIn(200, "A"), succeedIn(100, "B")).fork(reject, resolve)

    jest.advanceTimersByTime(150)
    jest.advanceTimersByTime(100)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(["A", "B"])
  })

  test("should fail on first error", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    zip(failIn(200, ERROR_RESULT), succeedIn(100, "B")).fork(reject, resolve)

    jest.advanceTimersByTime(150)
    jest.advanceTimersByTime(100)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should fail on first error (reversed)", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    zip(succeedIn(200, "A"), failIn(100, ERROR_RESULT)).fork(reject, resolve)

    jest.advanceTimersByTime(150)
    jest.advanceTimersByTime(100)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
