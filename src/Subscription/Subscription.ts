import { Task } from "../Task/Task"

export type Status = "active" | "inactive"
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type EventSubscriber<T> = (value: T) => void | Task<any, any>
export type StatusSubscriber = (status: Status) => void
export type Unsubscriber = () => void

export class Subscription<T> {
  private eventSubscribers_: Set<EventSubscriber<T>> = new Set<
    EventSubscriber<T>
  >()
  private status_: Status = "inactive"
  private statusSubscribers_: Set<StatusSubscriber> =
    new Set<StatusSubscriber>()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  public emit(value: T): Task<any, any[]> {
    return Task.all(
      Array.from(this.eventSubscribers_).map(sub => sub(value) || Task.empty()),
    )
  }

  public subscribe(fn: EventSubscriber<T>): Unsubscriber {
    this.eventSubscribers_.add(fn)
    this.checkStatus_()

    return () => {
      this.eventSubscribers_.delete(fn)

      this.checkStatus_()
    }
  }

  public clear(): void {
    this.eventSubscribers_.clear()

    this.checkStatus_()
  }

  public onStatusChange(fn: StatusSubscriber): () => void {
    this.statusSubscribers_.add(fn)

    return () => this.statusSubscribers_.delete(fn)
  }

  private checkStatus_() {
    const newstatus = this.eventSubscribers_.size > 0 ? "active" : "inactive"

    if (newstatus === this.status_) {
      return
    }

    this.status_ = newstatus

    Array.from(this.statusSubscribers_).map(sub => sub(newstatus))
  }
}
