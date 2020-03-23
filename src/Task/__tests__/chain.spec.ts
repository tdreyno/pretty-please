import { fail, succeed, Task } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("chain", () => {
  test("should succeed when chaining on a successful task", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .chain(r => succeed(r * 2))
      .fork(reject, resolve)

    expect(resolve).toBeCalledWith(10)
    expect(reject).not.toBeCalled()
  })

  test("should succeed when chaining on a successful promise", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .chain(r => Promise.resolve(r * 2))
      .fork(reject, resolve)

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r))

    expect(resolve).toBeCalledWith(10)
    expect(reject).not.toBeCalled()
  })

  test("should fail when chaining on a failed task", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(ERROR_RESULT)
      .chain(() => succeed(true))
      .fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should fail when chaining on a failed promise", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(ERROR_RESULT)
      .chain(() => Promise.reject(true))
      .fork(reject, resolve)

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r))

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should call computation once per chain", () => {
    const onFork = jest.fn()

    const task = new Task(() => {
      onFork()
    })

    task
      .chain(() => succeed(SUCCESS_RESULT))
      .fork(
        () => void 0,
        () => void 0,
      )

    task
      .chain(() => succeed(SUCCESS_RESULT))
      .fork(
        () => void 0,
        () => void 0,
      )

    expect(onFork).toBeCalledTimes(2)
  })

  test("should call computation once when nesting", () => {
    const onFork = jest.fn()

    const task = new Task(() => {
      onFork()
    })

    task
      .chain(() => succeed(SUCCESS_RESULT))
      .chain(() => succeed(SUCCESS_RESULT))
      .fork(
        () => void 0,
        () => void 0,
      )

    expect(onFork).toBeCalledTimes(1)
  })
})
