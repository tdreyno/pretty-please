import { fromLazyPromise } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("fromLazyPromise", () => {
  test("should succeed when a promise succeeds", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.resolve(SUCCESS_RESULT)

    fromLazyPromise(() => promise).fork(reject, resolve)

    await promise

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("should fail when a promise fails", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.reject(ERROR_RESULT)

    fromLazyPromise(() => promise).fork(reject, resolve)

    await promise.catch(() => void 0)

    expect(reject).toBeCalledWith(ERROR_RESULT)
    expect(resolve).not.toBeCalled()
  })

  test("should succeed immediately when not recieving a promise", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fromLazyPromise(() => SUCCESS_RESULT).fork(reject, resolve)

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })
})
