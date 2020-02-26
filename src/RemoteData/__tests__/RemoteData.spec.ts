/* eslint-disable @typescript-eslint/no-explicit-any */
import { ERROR_RESULT, SUCCESS_RESULT } from "../../Task/__tests__/util"
import { fail, fold, initialize, pending, succeed } from "../RemoteData"

describe("Remote Data", () => {
  test("Initialized", () => {
    const remoteData = initialize<any, any>()

    const fn = jest.fn()
    fold(fn, jest.fn(), jest.fn(), jest.fn(), remoteData)

    expect(fn).toHaveBeenCalled()
  })

  test("Pending", () => {
    const remoteData = pending<any, any>()

    const fn = jest.fn()
    fold(jest.fn(), fn, jest.fn(), jest.fn(), remoteData)

    expect(fn).toHaveBeenCalled()
  })

  test("Failed", () => {
    const remoteData = fail<string>(ERROR_RESULT)

    const fn = jest.fn()
    fold(jest.fn(), jest.fn(), fn, jest.fn(), remoteData)

    expect(fn).toHaveBeenCalledWith(ERROR_RESULT)
  })

  test("Succeeded", () => {
    const remoteData = succeed<string>(SUCCESS_RESULT)

    const fn = jest.fn()
    fold(jest.fn(), jest.fn(), jest.fn(), fn, remoteData)

    expect(fn).toHaveBeenCalledWith(SUCCESS_RESULT)
  })
})
