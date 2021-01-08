import { fromPromises } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("fromPromisea", () => {
  test("should succeed when all promises succeeds", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promiseA = Promise.resolve(SUCCESS_RESULT)
    const promiseB = Promise.resolve(SUCCESS_RESULT)

    fromPromises([promiseA, promiseB]).fork(reject, resolve)

    await promiseA.catch(() => void 0)
    await promiseB.catch(() => void 0)

    expect(resolve).toBeCalledWith([SUCCESS_RESULT, SUCCESS_RESULT])
    expect(reject).not.toBeCalled()
  })

  test("should fail when a promise fails", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promiseA = Promise.resolve(SUCCESS_RESULT)
    const promiseB = Promise.reject(ERROR_RESULT)

    fromPromises([promiseA, promiseB]).fork(reject, resolve)

    await promiseA.catch(() => void 0)
    await promiseB.catch(() => void 0)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
