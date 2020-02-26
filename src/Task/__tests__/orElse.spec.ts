import { fail, succeed } from "../Task"

describe("orElse", () => {
  test("should succeed with original result if successful", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .orElse(r => succeed(r ** 2))
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(5)
  })

  test("should succeed with else result if a failure", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(5)
      .orElse(r => succeed(r ** 2))
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(25)
  })

  test("should succeed with else resulting promise if a failure", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(5)
      .orElse(r => Promise.resolve(r ** 2))
      .fork(reject, resolve)

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r))

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(25)
  })
})
