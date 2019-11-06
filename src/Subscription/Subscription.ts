import { Task } from "../Task/Task";

export type Status = "active" | "inactive";
export type EventSubscriber<T> = (value: T) => void | Task<any, any>;
export type StatusSubscriber = (status: Status) => void;
export type Unsubscriber = () => void;

export class Subscription<T> {
  private eventSubscribers: Set<EventSubscriber<T>> = new Set<
    EventSubscriber<T>
  >();
  private status: Status = "inactive";
  private statusSubscribers: Set<StatusSubscriber> = new Set<
    StatusSubscriber
  >();

  public emit(value: T): Task<any, any[]> {
    return Task.all(
      Array.from(this.eventSubscribers).map(sub => sub(value) || Task.empty())
    );
  }

  public subscribe(fn: EventSubscriber<T>): Unsubscriber {
    this.eventSubscribers.add(fn);
    this.checkStatus();

    return () => {
      this.eventSubscribers.delete(fn);

      this.checkStatus();
    };
  }

  public clear() {
    this.eventSubscribers.clear();

    this.checkStatus();
  }

  public onStatusChange(fn: StatusSubscriber) {
    this.statusSubscribers.add(fn);

    return () => this.statusSubscribers.delete(fn);
  }

  private checkStatus() {
    const newstatus = this.eventSubscribers.size > 0 ? "active" : "inactive";

    if (newstatus === this.status) {
      return;
    }

    this.status = newstatus;

    Array.from(this.statusSubscribers).map(sub => sub(newstatus));
  }
}
