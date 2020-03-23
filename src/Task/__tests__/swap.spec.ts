import { fail, succeed } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("swap", () => {
  test("should swap successes to errors", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(ERROR_RESULT).swap().fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should swap errors to successes", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(SUCCESS_RESULT).swap().fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })
})
