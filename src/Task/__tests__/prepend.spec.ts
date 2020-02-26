import { succeed } from "../Task"

describe("prepend", () => {
  test("should prepend some number of constants to the current task value ", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .prepend(10, "15", 20)
      .fork(reject, resolve)

    expect(resolve).toBeCalledWith([10, "15", 20, 5])
    expect(reject).not.toBeCalled()
  })
})
