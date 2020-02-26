import { fail } from "../Task"
import { ERROR_RESULT } from "./util"

describe("fail", () => {
  test("should fail immediately with passed error", () => {
    const resolve = jest.fn()

    expect.hasAssertions()
    fail(ERROR_RESULT).fork(error => {
      expect(error).toBe(ERROR_RESULT)
    }, resolve)

    expect(resolve).not.toBeCalled()
  })
})
