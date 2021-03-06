import { Subscription } from "../Subscription"

describe("Subscription", () => {
  test("should call subscribers when emitting", () => {
    const sub = new Subscription<string>()

    const subscriber1 = jest.fn()
    const subscriber2 = jest.fn()

    sub.subscribe(subscriber1)
    sub.subscribe(subscriber2)

    void sub.emit("test")

    expect(subscriber1).toBeCalledWith("test")
    expect(subscriber2).toBeCalledWith("test")
  })

  test("should remove all subscribers when clearing", () => {
    const sub = new Subscription<string>()

    const subscriber1 = jest.fn()
    const subscriber2 = jest.fn()

    sub.subscribe(subscriber1)
    sub.subscribe(subscriber2)

    sub.clear()

    void sub.emit("test")

    expect(subscriber1).not.toBeCalledWith("test")
    expect(subscriber2).not.toBeCalledWith("test")
  })

  test("should still resolve with no subscribers", () => {
    const sub = new Subscription<string>()

    expect.hasAssertions()

    const reject = jest.fn()
    const resolve = jest.fn()

    sub.emit("test").fork(reject, resolve)

    expect(reject).not.toBeCalled()
    expect(resolve).toBeCalledWith([])
  })

  test("should notify when the first subscriber is added", () => {
    const sub = new Subscription<string>()

    expect.hasAssertions()

    const onStatusChange = jest.fn()

    sub.onStatusChange(onStatusChange)

    expect(onStatusChange).not.toBeCalled()

    const unsubscriber = sub.subscribe(jest.fn())

    expect(onStatusChange).toBeCalledWith("active")

    unsubscriber()

    expect(onStatusChange).toBeCalledWith("inactive")
  })
})
