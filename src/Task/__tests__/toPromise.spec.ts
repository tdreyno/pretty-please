import { fail, succeed } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("toPromise", () => {
  test("promise should succeed when the task succeeds", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = succeed(SUCCESS_RESULT)
    const promise = task.toPromise().then(resolve, reject)

    task.fork(
      () => void 0,
      () => void 0
    )

    await promise.catch(() => void 0)

    expect(resolve).toBeCalledWith(SUCCESS_RESULT)
    expect(reject).not.toBeCalled()
  })

  test("promise should reject when the task fails", async () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    const task = fail(ERROR_RESULT)
    const promise = task.toPromise().then(resolve, reject)

    task.fork(
      () => void 0,
      () => void 0
    )

    await promise.catch(() => void 0)

    expect(reject).toBeCalledWith(ERROR_RESULT)
    expect(resolve).not.toBeCalled()
  })
})
