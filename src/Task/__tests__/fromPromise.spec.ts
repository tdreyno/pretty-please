import { fromPromise, Task } from "../Task"
import { ERROR_RESULT, ERROR_TYPE, isError, SUCCESS_RESULT } from "./util"

describe("fromPromise", () => {
  test("should succeed when a promise succeeds", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.resolve(SUCCESS_RESULT)

    fromPromise(promise).fork(reject, resolve)

    await promise.catch(() => void 0)

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("should fail when a promise fails", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.reject(ERROR_RESULT)

    fromPromise(promise).fork(reject, resolve)

    await promise.catch(() => void 0)

    expect(reject).toBeCalledWith(ERROR_RESULT)
    expect(resolve).not.toBeCalled()
  })

  test("should succeed immediately when not recieving a promise", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fromPromise(SUCCESS_RESULT).fork(reject, resolve)

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("should be able to type guard error type", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.reject(ERROR_RESULT)
    const verifyType = (t: Task<ERROR_TYPE, never>) => t

    fromPromise(promise)
      .validateError(isError)
      .map(verifyType)
      .fork(reject, resolve)

    await promise.catch(() => void 0)

    expect(reject).toBeCalledWith(ERROR_RESULT)
    expect(resolve).not.toBeCalled()
  })
})
