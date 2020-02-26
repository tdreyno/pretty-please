import { succeedBy } from "../Task"
import { SUCCESS_RESULT, ERROR_RESULT } from "./util"

describe("succeedBy", () => {
  test("should resolve by calling the function", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeedBy(() => SUCCESS_RESULT).fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })

  test("should reject if calling the function throws an exception", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeedBy(() => {
      throw ERROR_RESULT
    }).fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
