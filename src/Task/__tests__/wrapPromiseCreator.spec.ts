/* eslint-disable @typescript-eslint/no-unused-vars */
import { wrapPromiseCreator } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("wrapPromiseCreator", () => {
  test("should succeed when a promise succeeds", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.resolve(SUCCESS_RESULT)
    const makePromise = (_a: string, _b: number) => promise

    const runTask = wrapPromiseCreator(makePromise)
    runTask("test", 1).fork(reject, resolve)

    await promise

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("should fail when a promise fails", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const promise = Promise.reject(ERROR_RESULT)
    const makePromise = (_a: number, _b: string) => promise

    const runTask = wrapPromiseCreator(makePromise)
    runTask(1, "test").fork(reject, resolve)

    await promise.catch(() => void 0)

    expect(reject).toBeCalledWith(ERROR_RESULT)
    expect(resolve).not.toBeCalled()
  })
})
