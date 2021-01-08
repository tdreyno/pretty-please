export const SUCCESS_RESULT = "__SUCCESS__"
export const ERROR_RESULT = "__ERROR__"

export type SUCCESS_TYPE = "__SUCCESS__"
export type ERROR_TYPE = "__ERROR__"

export const isSuccess = (v: unknown): v is SUCCESS_TYPE => v === SUCCESS_RESULT
export const isError = (v: unknown): v is ERROR_TYPE => v === ERROR_RESULT
