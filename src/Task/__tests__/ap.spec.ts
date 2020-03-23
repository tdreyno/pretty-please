import { fail, succeed } from "../Task"
import { ERROR_RESULT } from "./util"

describe("ap", () => {
  test("should apply converter function result to finished task", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const doubler = (r: number) => r * 2

    succeed(doubler).ap(succeed(5)).fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(10)
  })

  test("should return original error when the original task fails", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const doubler = (r: number) => r * 2

    succeed(doubler).ap(fail(ERROR_RESULT)).fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
