import { all, failIn, succeedIn } from "../Task"
import { ERROR_RESULT } from "./util"

describe("all", () => {
  test("should run all tasks in parallel and return an array of results in their original order", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    all([succeedIn(200, "A"), succeedIn(100, "B")]).fork(reject, resolve)

    jest.advanceTimersByTime(250)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(["A", "B"])
  })

  test("should fail on first error", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    all([failIn(200, ERROR_RESULT), succeedIn(100, "B")]).fork(reject, resolve)

    jest.advanceTimersByTime(250)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
