import { fail, fork, succeed, Task } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("fork", () => {
  test("should work the same as pipeline fork", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fork(reject, resolve, succeed(SUCCESS_RESULT))

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })

  test("should call resolve on success", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(SUCCESS_RESULT).fork(reject, resolve)

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("should call reject on failure", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(ERROR_RESULT).fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should call computation on each fork", () => {
    const onFork = jest.fn()

    const task = new Task(() => {
      onFork()
    })

    task.fork(
      () => void 0,
      () => void 0
    )
    task.fork(
      () => void 0,
      () => void 0
    )

    expect(onFork).toBeCalledTimes(2)
  })
})
