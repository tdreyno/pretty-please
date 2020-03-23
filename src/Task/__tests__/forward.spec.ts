import { succeed } from "../Task"

describe("forward", () => {
  test("should replace the current task value with a constant", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5).forward(10).fork(reject, resolve)

    expect(resolve).toBeCalledWith(10)
    expect(reject).not.toBeCalled()
  })
})
