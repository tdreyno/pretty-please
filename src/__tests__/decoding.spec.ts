import { empty, of, Task, fail } from "../Task/Task"

interface Command {
  commandId?: string
}

const CMD: Command = { commandId: "1234" }

const getCommandSuccess = (): Task<unknown, Command | undefined> =>
  of<Command>(CMD)

const getCommandFailure = (): Task<unknown, Command | undefined> => empty()

const getCommandNoCommand = (): Task<unknown, Command | undefined> =>
  of<Command>({ commandId: undefined })

const rejectFailures = (result?: Command): Task<undefined, Command> =>
  result && result.commandId ? of(result) : fail(undefined)

enum Status {
  CREATED,
  COMPLETED,
}

interface Result {
  status: Status
  cmd: Command
}

const executeCommandCreated = (
  cmd: Command,
): Task<unknown, Result | undefined> =>
  of<Result>({ cmd, status: Status.CREATED })

const executeCommandCompleted = (
  cmd: Command,
): Task<unknown, Result | undefined> =>
  of<Result>({ cmd, status: Status.COMPLETED })

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const executeCommandFail = (_cmd: Command): Task<unknown, Result | undefined> =>
  fail(undefined)

const keepCreated = (result?: Result): Task<undefined, Result> =>
  result && result.status === Status.CREATED ? of(result) : fail(undefined)

describe("decoding", () => {
  test("success", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandSuccess().chain(rejectFailures).fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith(CMD)
  })

  test("failure", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandFailure().chain(rejectFailures).fork(reject, resolve)

    expect(reject).toBeCalledWith(undefined)
    expect(resolve).not.toBeCalled()
  })

  test("no command", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandNoCommand().chain(rejectFailures).fork(reject, resolve)

    expect(reject).toBeCalledWith(undefined)
    expect(resolve).not.toBeCalled()
  })

  test("success created", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandSuccess()
      .chain(rejectFailures)
      .chain(executeCommandCreated)
      .chain(keepCreated)
      .fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith({ cmd: CMD, status: Status.CREATED })
  })

  test("success completed", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandSuccess()
      .chain(rejectFailures)
      .chain(executeCommandCompleted)
      .chain(keepCreated)
      .fork(reject, resolve)

    expect(reject).toBeCalledWith(undefined)
    expect(resolve).not.toBeCalled()
  })

  test("success then failed", () => {
    const resolve = jest.fn()
    const reject = jest.fn()

    getCommandSuccess()
      .chain(rejectFailures)
      .chain(executeCommandFail)
      .chain(keepCreated)
      .fork(reject, resolve)

    expect(reject).toBeCalledWith(undefined)
    expect(resolve).not.toBeCalled()
  })
})
