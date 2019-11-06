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
});
