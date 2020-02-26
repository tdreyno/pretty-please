import { fail, succeed } from "../Task"
import { ERROR_RESULT, SUCCESS_RESULT } from "./util"

describe("async/await interop", () => {
  test("should succeed with async await", async () => {
    const result = await succeed(SUCCESS_RESULT)
    expect(result).toBe(SUCCESS_RESULT)
  })

  test("should throw with async await", async () => {
    expect.hasAssertions()

    try {
      await fail(ERROR_RESULT)
    } catch (e) {
      expect(e).toBe(ERROR_RESULT)
    }
  })
})
