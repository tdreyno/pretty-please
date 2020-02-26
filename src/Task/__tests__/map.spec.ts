import { fail, succeed, Task } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("map", () => {
  test("should map successfuly results into new data", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .map(r => r * 2)
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(10)
  })

  test("should still fail when mapping failed task", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    fail(ERROR_RESULT)
      .map(r => r * 2)
      .fork(reject, resolve)

    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })

  test("should call computation once per map", () => {
    const onFork = jest.fn()

    const task = new Task(() => {
      onFork()
    })

    task
      .map(() => SUCCESS_RESULT)
      .fork(
        () => void 0,
        () => void 0
      )
    task
      .map(() => SUCCESS_RESULT)
      .fork(
        () => void 0,
        () => void 0
      )

    expect(onFork).toBeCalledTimes(2)
  })

  test("should call computation once when nesting", () => {
    const onFork = jest.fn()

    const task = new Task(() => {
      onFork()
    })

    task
      .map(() => SUCCESS_RESULT)
      .map(() => SUCCESS_RESULT)
      .fork(
        () => void 0,
        () => void 0
      )

    expect(onFork).toBeCalledTimes(1)
  })
})
