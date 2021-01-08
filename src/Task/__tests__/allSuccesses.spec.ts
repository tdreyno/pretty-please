import { allSuccesses, failIn, succeedIn } from "../Task"
import { ERROR_RESULT } from "./util"

describe("allSuccesses", () => {
  test("should run all tasks in parallel and return an array of results in their original order", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    allSuccesses([succeedIn(200, "A"), succeedIn(100, "B")]).fork(
      reject,
      resolve,
    )

    jest.advanceTimersByTime(250)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(["B", "A"])
  })

  test("should allow errors", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    allSuccesses([failIn(200, ERROR_RESULT), succeedIn(100, "B")]).fork(
      reject,
      resolve,
    )

    jest.advanceTimersByTime(250)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(["B"])
  })
})
