import { Subscription } from "../Subscription";

describe("Subscription", () => {
  test("should call subscribers when emitting", () => {
    const sub = new Subscription<string>();

    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    sub.subscribe(subscriber1);
    sub.subscribe(subscriber2);

    sub.emit("test");

    expect(subscriber1).toBeCalledWith("test");
    expect(subscriber2).toBeCalledWith("test");
  });

  test("should remove all subscribers when clearing", () => {
    const sub = new Subscription<string>();

    const subscriber1 = jest.fn();
    const subscriber2 = jest.fn();

    sub.subscribe(subscriber1);
    sub.subscribe(subscriber2);

    sub.clear();

    sub.emit("test");

    expect(subscriber1).not.toBeCalledWith("test");
    expect(subscriber2).not.toBeCalledWith("test");
  });
});
