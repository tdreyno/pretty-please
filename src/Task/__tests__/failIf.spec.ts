import { of } from "../Task"

describe("failIf", () => {
  test("should fail with new error type", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const lt5 = (v: number) => v < 5

    of(4)
      .failIf(lt5, v => `${v} < 5`)
      .fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith("4 < 5")
  })

  test("should succeed if predicate fails", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const lt5 = (v: number) => v < 5

    of(10)
      .failIf(lt5, v => `${v} < 5`)
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(10)
  })
})
