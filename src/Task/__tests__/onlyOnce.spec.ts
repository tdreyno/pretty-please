import { Task } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("onlyOnce", () => {
  test("should succeed and skip earlier task executions on second call", () => {
    const didRootExecute = jest.fn()
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = new Task<never, string>((_, rootResolve) => {
      didRootExecute()
      rootResolve(SUCCESS_RESULT)
    })

    const only = task.onlyOnce()

    // First time.
    only.fork(reject, resolve)

    expect(didRootExecute).toHaveBeenCalledTimes(1)
    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)

    // Second time.
    only.fork(reject, resolve)

    expect(didRootExecute).toHaveBeenCalledTimes(1)
    expect(reject).not.toBeCalled()
    expect(resolve).toHaveBeenCalledTimes(2)
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })

  test("should fail and skip earlier task executions on second call", () => {
    const didRootExecute = jest.fn()
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = new Task<string, never>(rootReject => {
      didRootExecute()
      rootReject(ERROR_RESULT)
    })

    const only = task.onlyOnce()

    // First time.
    only.fork(reject, resolve)

    expect(didRootExecute).toHaveBeenCalledTimes(1)
    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)

    // Second time.
    only.fork(reject, resolve)

    expect(didRootExecute).toHaveBeenCalledTimes(1)
    expect(resolve).not.toBeCalled()
    expect(reject).toHaveBeenCalledTimes(2)
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
