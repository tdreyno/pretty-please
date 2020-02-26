import { succeedIn } from "../Task"
import { SUCCESS_RESULT } from "./util"

describe("succeedIn", () => {
  test("should resolve in the future with passed value", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeedIn(100, SUCCESS_RESULT).fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).not.toBeCalled()

    jest.advanceTimersByTime(100)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })
})
