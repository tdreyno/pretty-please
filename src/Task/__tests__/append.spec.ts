import { succeed } from "../Task"

describe("append", () => {
  test("should append some number of constants to the current task value ", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5).append(10, "15", 20).fork(reject, resolve)

    expect(resolve).toBeCalledWith([5, 10, "15", 20])
    expect(reject).not.toBeCalled()
  })
})
