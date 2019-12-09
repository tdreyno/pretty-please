import { EndOfSequence, fail, succeed, trySequence } from "../Task";

describe("trySequence", () => {
  test("should run all task in order and return the first that succeeds", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(() => true, [fail("A"), succeed("B")]).fork(reject, resolve);

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith("B");
  });

  test("should ask whether to continue on errors", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(e => e === "A", [fail("A"), fail("B"), succeed("C")]).fork(
      reject,
      resolve
    );

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith("B");
  });

  test("should accept a new task as a continuation", () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(() => succeed("D"), [fail("A"), fail("B"), succeed("C")]).fork(
      reject,
      resolve
    );

    expect(resolve).toBeCalledWith("D");
    expect(reject).not.toBeCalled();
  });

  test("should throw EndOfSequence if everything fails", () => {
    const resolve = jest.fn();

    expect.hasAssertions();
    trySequence(() => true, [fail("A"), fail("B")]).fork(
      e => expect(e).toBeInstanceOf(EndOfSequence),
      resolve
    );

    expect(resolve).not.toBeCalled();
  });

  test("should run all promises in order and return the first that succeeds", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(() => true, [Promise.reject("A"), Promise.resolve("B")]).fork(
      reject,
      resolve
    );

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(reject).not.toBeCalled();
    expect(resolve).toBeCalledWith("B");
  });

  test("should ask whether to continue on promise errors", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(e => e === "A", [
      Promise.reject("A"),
      Promise.reject("B"),
      Promise.resolve("C")
    ]).fork(reject, resolve);

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(resolve).not.toBeCalled();
    expect(reject).toBeCalledWith("B");
  });

  test("should accept a new promise as a continuation", async () => {
    const resolve = jest.fn();
    const reject = jest.fn();

    trySequence(() => Promise.resolve("D"), [
      Promise.reject("A"),
      Promise.reject("B"),
      Promise.resolve("C")
    ]).fork(reject, resolve);

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(resolve).toBeCalledWith("D");
    expect(reject).not.toBeCalled();
  });

  test("should throw EndOfSequence if all promises fail", async () => {
    const resolve = jest.fn();

    expect.hasAssertions();

    trySequence(() => true, [Promise.reject("A"), Promise.reject("B")]).fork(
      e => expect(e).toBeInstanceOf(EndOfSequence),
      resolve
    );

    // "hack" to flush the promise queue
    await new Promise(r => setImmediate(r));

    expect(resolve).not.toBeCalled();
  });
});
