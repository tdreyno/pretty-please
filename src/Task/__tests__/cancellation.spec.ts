import { failIn, succeedIn } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("cancellation", () => {
  test("should be able to cancel a successful task", () => {
    jest.useFakeTimers()

    const resolve = jest.fn()
    const reject = jest.fn()

    succeedIn(1000, SUCCESS_RESULT).fork(reject, resolve).cancel()

    jest.runAllTimers()

    expect(resolve).not.toBeCalled()
    expect(reject).not.toBeCalled()
  })

  test("should be able to cancel a failed task", () => {
    jest.useFakeTimers()

    const resolve = jest.fn()
    const reject = jest.fn()

    failIn(1000, ERROR_RESULT).fork(reject, resolve).cancel()

    jest.runAllTimers()

    expect(resolve).not.toBeCalled()
    expect(reject).not.toBeCalled()
  })
})
