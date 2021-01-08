import { failedValidation, successfulValidation, Validation } from "../../util"
import { fail, succeed } from "../Task"
import { ERROR_RESULT } from "./util"

enum GT4Brand {
  _ = "",
}
type GT4 = GT4Brand & number

const isGT4 = (value: number): value is GT4 => value > 4

const isGT4Validator = (value: number): Validation<string, GT4> => {
  if (isGT4(value)) {
    return successfulValidation<GT4>(value)
  }

  return failedValidation(`${value.toString()} <= 4`)
}

describe("validate", () => {
  test("should call validate successfully", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(5)
      .validate(isGT4Validator)
      .map((val: GT4) => val)
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(5)
  })

  test("should call validate when failing", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    succeed(3)
      .validate(isGT4Validator)
      .mapError((err: string) => err)
      .fork(reject, resolve)

    expect(reject).toBeCalledWith("3 <= 4")
    expect(resolve).not.toBeCalled()
  })

  test("should call not validate when given a failure", () => {
    const resolve = jest.fn()
    const reject = jest.fn()
    const validate = jest.fn()

    fail(ERROR_RESULT).validate(validate).fork(reject, resolve)

    expect(validate).not.toBeCalled()
    expect(reject).toBeCalledWith(ERROR_RESULT)
  })
})
