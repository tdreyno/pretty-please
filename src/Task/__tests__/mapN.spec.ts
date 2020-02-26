import { fail, map2, map3, map4, succeed } from "../Task"
import { ERROR_RESULT } from "./util"

describe("mapN", () => {
  describe("map2", () => {
    test("should combine two successful tasks into one result", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map2(a => b => a * b, succeed(5), succeed(2)).fork(reject, resolve)

      expect(reject).not.toBeCalled()
      expect(resolve).toBeCalledWith(10)
    })

    test("should fail when first mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map2(a => b => a * b, fail(ERROR_RESULT), succeed(2)).fork(
        reject,
        resolve
      )

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when second mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map2(a => b => a * b, succeed(2), fail(ERROR_RESULT)).fork(
        reject,
        resolve
      )

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })
  })

  describe("map3", () => {
    test("should combine three successful tasks into one result", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map3(a => b => c => a + b + c, succeed(5), succeed(2), succeed(-1)).fork(
        reject,
        resolve
      )

      expect(reject).not.toBeCalled()
      expect(resolve).toBeCalledWith(6)
    })

    test("should fail when first mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map3(
        a => b => c => a * b * c,
        fail(ERROR_RESULT),
        succeed(2),
        succeed(2)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when second mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map3(
        a => b => c => a * b * c,
        succeed(2),
        fail(ERROR_RESULT),
        succeed(2)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when third mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map3(
        a => b => c => a * b * c,
        succeed(2),
        succeed(2),
        fail(ERROR_RESULT)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })
  })

  describe("map4", () => {
    test("should combine four successful tasks into one result", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map4(
        a => b => c => d => a + b + c + d,
        succeed(5),
        succeed(2),
        succeed(-1),
        succeed(7)
      ).fork(reject, resolve)

      expect(reject).not.toBeCalled()
      expect(resolve).toBeCalledWith(13)
    })

    test("should fail when first mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map4(
        a => b => c => d => a * b * c * d,
        fail(ERROR_RESULT),
        succeed(2),
        succeed(2),
        succeed(2)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when second mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map4(
        a => b => c => d => a * b * c * d,
        succeed(2),
        fail(ERROR_RESULT),
        succeed(2),
        succeed(2)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when third mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map4(
        a => b => c => d => a * b * c * d,
        succeed(2),
        succeed(2),
        fail(ERROR_RESULT),
        succeed(2)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })

    test("should fail when fourth mapping failed task", () => {
      const resolve = jest.fn()
      const reject = jest.fn()

      map4(
        a => b => c => d => a * b * c * d,
        succeed(2),
        succeed(2),
        succeed(2),
        fail(ERROR_RESULT)
      ).fork(reject, resolve)

      expect(resolve).not.toBeCalled()
      expect(reject).toBeCalledWith(ERROR_RESULT)
    })
  })
})
