import { Task } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("succeedIf", () => {
  test("should succeed and skip earlier task executions when cache checking function succeeds", () => {
    const didRootExecute = jest.fn()
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = new Task<never, string>((_, rootResolve) => {
      didRootExecute()
      rootResolve(SUCCESS_RESULT)
    })

    task.succeedIf(() => "Intercept").fork(reject, resolve)

    expect(didRootExecute).not.toBeCalled()
    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith("Intercept")
  })

  test("should resolve like normal task when cache checking function fails", () => {
    const didRootExecute = jest.fn()
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = new Task<never, string>((_, rootResolve) => {
      didRootExecute()
      rootResolve(SUCCESS_RESULT)
    })

    task.succeedIf(() => undefined).fork(reject, resolve)

    expect(didRootExecute).toBeCalled()
    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
  })

  test("should reject like normal task when cache checking function fails", () => {
    const didRootExecute = jest.fn()
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = new Task<string, never>(rootReject => {
      didRootExecute()
      rootReject(ERROR_RESULT)
    })

    task.succeedIf(() => undefined).fork(reject, resolve)

    expect(didRootExecute).toBeCalled()
    expect(resolve).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
