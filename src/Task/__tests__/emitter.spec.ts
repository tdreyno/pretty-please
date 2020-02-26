import { emitter } from "../Task"
import { ERROR_RESULT } from "./util"

describe("emitter", () => {
  test("should fail when external control has failed", () => {
    jest.useFakeTimers()

    const [task, emit] = emitter((a: number) => {
      if (a % 2 !== 0) {
        throw ERROR_RESULT
      }

      return a * 2
    })

    setTimeout(() => {
      emit(1)
    }, 100)

    expect.hasAssertions()
    task.fork(error => {
      expect(error).toBe(ERROR_RESULT)
    }, jest.fn())

    jest.runAllTimers()
  })

  test("should succeed when external control has succeeded", () => {
    jest.useFakeTimers()

    const [task, emit] = emitter((a: number) => {
      if (a % 2 !== 0) {
        throw ERROR_RESULT
      }

      return a * 2
    })

    setTimeout(() => {
      emit(2)
    }, 100)

    expect.hasAssertions()
    task.fork(jest.fn(), result => {
      expect(result).toBe(4)
    })

    jest.runAllTimers()
  })

  test("should wait when until something happens", () => {
    const [task] = emitter((a: number) => {
      if (a % 2 !== 0) {
        throw ERROR_RESULT
      }

      return a * 2
    })

    const reject = jest.fn()
    const resolve = jest.fn()

    expect.hasAssertions()
    task.fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).not.toBeCalled()
  })

  test("should provide a stream of results", () => {
    jest.useFakeTimers()

    const [task, emit] = emitter((a: number) => {
      if (a % 2 !== 0) {
        throw ERROR_RESULT
      }

      return a * 2
    })

    setTimeout(() => {
      emit(2)
    }, 100)

    setTimeout(() => {
      emit(1)
    }, 200)

    const reject = jest.fn()
    const resolve = jest.fn()

    expect.hasAssertions()
    task.fork(
      error => {
        reject(error)
        expect(error).toBe(ERROR_RESULT)
      },
      result => {
        resolve(result)
        expect(result).toBe(4)
      }
    )

    expect(reject).not.toHaveBeenCalled()
    expect(resolve).not.toHaveBeenCalled()

    jest.advanceTimersByTime(100)

    expect(reject).not.toHaveBeenCalled()
    expect(resolve).toHaveBeenCalledWith(4)

    jest.advanceTimersByTime(100)

    expect(reject).toHaveBeenCalledWith(ERROR_RESULT)
  })
})
