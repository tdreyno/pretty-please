import { Task } from "../Task/Task";

export type Subscriber<T> = (value: T) => void | Task<any, any>;
export type Unsubscriber = () => void;

export class Subscription<T> {
  private subscribers: Set<Subscriber<T>> = new Set<Subscriber<T>>();

  public emit(value: T): Task<any, any[]> {
    return Task.all(
      Array.from(this.subscribers).map(sub => sub(value) || Task.empty())
    );
  }

  public subscribe(fn: Subscriber<T>): Unsubscriber {
    this.subscribers.add(fn);
    return () => this.subscribers.delete(fn);
  }

  public clear() {
    this.subscribers.clear();
  }
}
