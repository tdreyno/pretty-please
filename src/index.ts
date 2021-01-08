import RemoteData from "./RemoteData/index"
import Subscription from "./Subscription/index"
import Task, { ExternalTask, LoopBreak, LoopContinue } from "./Task/index"

export * from "./util"
export { RemoteData, Task, ExternalTask, LoopContinue, LoopBreak, Subscription }

/**
 * Given a function that returns a task, return a new function that
 * returns a promise instead.
 * @param fn A function which returns a promise
 */
export const wrapTaskCreator = <S, Args extends unknown[]>(
  fn: (...args: Args) => Task<unknown, S>,
) => (...args: Args): Promise<S> => fn(...args).toPromise()
