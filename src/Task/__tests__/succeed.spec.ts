import { succeed } from "../Task"
import { SUCCESS_RESULT } from "./util"

describe("succeed", () => {
  test("should resolve immediately with passed value", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(SUCCESS_RESULT).fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })
})
