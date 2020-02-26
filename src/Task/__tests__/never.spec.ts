import { never } from "../Task"

describe("never", () => {
  test("should never succeed or fail", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    never().fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).not.toBeCalled()
  })
})
