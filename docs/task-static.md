# Creating Tasks

The following functions are used to create Tasks. They can be used from either the `Task` class (for example `Task.of`) or imported directly from the library as a function (simply, `of`).

Many of these methods also exist on the [Task instance](docs/task-instance.md). They exist here in their pure form in the hopes that the [proposed Pipeline operator](https://github.com/tc39/proposal-pipeline-operator) ever makes its way into the language.

## of

Creates a task that will always succeed with the given value. Also aliased as `succeed`. Similar in use to `Promise.resolve`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type of = <S, E = any>(result: S) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## empty

Creates a task that will always succeed a result of void (undefined). Useful for chaining tasks which create side-effects, but don't return a useful value.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, void> = Task.empty();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type empty = <E = any>() => Task<E, void>;
```

{% endtab %}
{% endtabs %}

## succeedIn

Creates a task that will always succeed with the given value, but will take some number of milliseconds before it does. Useful for simulating latency or inserting timeouts in a task chain.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.succeedIn(100, 5);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type succeedIn = <S, E = any>(ms: number, result: S) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## succeedBy

Creates a task that will always succeed with the result of a function. Useful for bringing global state or side-effects into a task chain.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.succeedBy(() => 5);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type succeedBy = <S, E = any>(result: () => S) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## fail

Creates a task that will always fail with the given error. Similar in use to `Promise.reject`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<string, unknown> = Task.fail("error");
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type fail = <E, S = any>(error: E) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## failIn

Creates a task that will always fail with the given error, but will take some number of milliseconds before it does. Useful for simulating latency or inserting timeouts in a task chain.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<string, unknown> = Task.failIn(100, "error");
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type failIn = <E, S = any>(ms: number, error: E) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## all

Creates a task that will always run an array of tasks in **parallel**. The result in a new task which returns the successful results as an array, in the same order as the tasks were given. If any task fails, the resulting task will fail with that error.

All task error and value types must be the same. If you need different types for the items of the array, consider using `ap` instead.

Works similarly to `Promise.all`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number[]> = Task.all([of(5), of(10)]);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type all<E, S> = (
  tasksOrPromises: Array<Task<E, S> | Promise<S>>
) => Task<E, S[]>;
```

{% endtab %}
{% endtabs %}

## sequence

Creates a task that will always run an array of tasks **serially**. The result in a new task which returns the successful results as an array, in the same order as the tasks were given. If any task fails, the resulting task will fail with that error.

All task error and value types must be the same. If you need different types for the items of the array, consider simply chaining the tasks together in order.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number[]> = Task.sequence([of(5), of(10)]);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type sequence = <E, S>(
  tasksOrPromises: Array<Task<E, S> | Promise<S>>
) => Task<E, S[]>;
```

{% endtab %}
{% endtabs %}

## firstSuccess

Creates a task that will always run an array of tasks in **parallel** and return the value of the first successful task. If all tasks fail, the error result will be an array of the error results from each task in the same order as they were given.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<string[], number> = Task.firstSuccess([fail("error"), of(10)]);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type firstSuccess<E, S>(
  tasksOrPromises: Array<Task<E, S> | Promise<S>>
) => Task<E[], S>;
```

{% endtab %}
{% endtabs %}

## never

Creates a task that will never succeed or fail. Uses the [TypeScript `never` type](https://www.typescriptlang.org/docs/handbook/basic-types.html#never) which allows the type checker to detect impossible cases and warn the developer at compile time.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<never, never> = Task.never();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type never = () => Task<never, never>;
```

{% endtab %}
{% endtabs %}

## fromPromise

Converts a Promise into a Task. Because Promise start in a "pending" state, that process will already be running before the Task is forked. This means that if two tasks chain off this one, the initial Promise (say, a web request) will only happen once. Consider using `fromLazyPromise` instead to bring Promise more in line with the lazy Task philosophy.

Promise's do not track an error type (one of the reasons Tasks are more powerful) so the resulting Task is unable to infer the error type as well. It is recommended to pass it in as a generic.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, Response> = Task.fromPromise(fetch(URL));
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type fromPromise = <S, E = any>(maybePromise: S | Promise<S>) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## fromLazyPromise

Given a function which returns a Promise, turn that into a Task. This allows the Promise not to start until the Task forks (following the lazy philosophy of the rest of the library). This also means if two tasks chain from this one, the promise creating function will be called twice. See `onlyOnce` if you wish to avoid this.

Promise's do not track an error type (one of the reasons Tasks are more powerful) so the resulting Task is unable to infer the error type as well. It is recommended to pass it in as a generic.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, Response> = Task.fromLazyPromise(() => fetch(URL));
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type fromLazyPromise = <S, E = any>(
  getPromise: () => S | Promise<S>
) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## race

Creates a task that will always run an array of tasks in **parallel**. The first task to finish is the resulting error or value. Useful for implementing network request timeouts by racing a task which fails in x milliseconds and a task which makes the request.

Works similarly to `Promise.race`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.race([
  succeedIn(100, 5),
  succeedIn(10, -5)
]);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type race = <E, S>(
  tasksOrPromises: Array<Task<E, S> | Promise<S>>
) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## external

Creates a Task which can be controlled externally by providing `reject` and `resolve` methods. Must provide error and value types as generics.

Useful for integrating with callback based libraries and APIs.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task = Task.external<unknown, number>();

try {
  attemptSomething();
  task.resolve(5);
} catch (e) {
  task.reject(e);
}
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type external = <E, S>() => ExternalTask<E, S>;
```

{% endtab %}
{% endtabs %}

## emitter

Creates a Task that wraps a callback. Also returns an `emit` callback which when called, executes the callback. If the callback throws an exception, that is the error response of the task. Otherwise the returned value of the callback is considered a success.

Must provide error and value types as generics.

Useful for integrating with callback based libraries and APIs. Provides automatic exception handling.

{% tabs %}
{% tab title="Usage" %}

```typescript
const [task, emit] = Task.emitter<unknown, string>((e: Event) => {
  attemptSomething();

  return e.type;
});

window.onclick = e => {
  emit(e);
};
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type emitter = <Args extends any[], R>(
  fn: (...args: Args) => R
) => [ExternalTask<any, R>, (...args: Args) => void];
```

{% endtab %}
{% endtabs %}

## map2

Given two tasks, run the successful values through a mapping function to combine them into a new output. Unlike `Task.all`, this allows each task to be of a different type.

The function must be curried. That is, each parameter is handled one at a time. A version of this function which is not curried is available as `zipWith`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, string]> = Task.map2(
  a => b => [a, b],
  Task.of(5),
  Task.of("Hello")
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type map2 = <E, E2, S, S2, S3>(
  fn: (a: S) => (b: S2) => S3,
  taskA: Task<E, S> | Promise<S>,
  taskB: Task<E2, S2> | Promise<S2>
) => Task<E | E2, S3>;
```

{% endtab %}
{% endtabs %}

## map3

Given three tasks, run the successful values through a mapping function to combine them into a new output. Unlike `Task.all`, this allows each task to be of a different type.

The function must be curried. That is, each parameter is handled one at a time.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, string, boolean]> = Task.map3(
  a => b => c => [a, b, c],
  Task.of(5),
  Task.of("Hello"),
  Task.of(true)
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type map3 = <E, E2, E3, S, S2, S3, S4>(
  fn: (a: S) => (b: S2) => (c: S3) => S4,
  taskA: Task<E, S> | Promise<S>,
  taskB: Task<E2, S2> | Promise<S2>,
  taskC: Task<E3, S3> | Promise<S3>
) => Task<E | E2 | E3, S4>;
```

{% endtab %}
{% endtabs %}

## map4

Given four tasks, run the successful values through a mapping function to combine them into a new output. Unlike `Task.all`, this allows each task to be of a different type.

The function must be curried. That is, each parameter is handled one at a time.

If you need to operate on more than 4 tasks, consider using `ap` which can combine an arbitrary number of tasks using a mapping function.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, string, boolean, Set<string>]> = Task.map4(
  a => b => c => d => [a, b, c, d],
  Task.of(5),
  Task.of("Hello"),
  Task.of(true),
  Task.of(new Set(["hi"]))
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type map4 = <E, E2, E3, E4, S, S2, S3, S4, S5>(
  fn: (a: S) => (b: S2) => (c: S3) => (d: S4) => S5,
  taskA: Task<E, S> | Promise<S>,
  taskB: Task<E2, S2> | Promise<S2>,
  taskC: Task<E3, S3> | Promise<S3>,
  taskD: Task<E4, S4> | Promise<S4>
) => Task<E | E2 | E3 | E4, S5>;
```

{% endtab %}
{% endtabs %}

## loop

Allows the construction of a recursive, asynchrous loop. Given an initial starting value, call the currrent loop function and return a Task that contains either a `LoopBreak` or `LoopContinue` instance. The instance holds on to the current value. Will loop until it encounters a `LoopBreak`.

This is a simplified version of what some will accomplish with a `Array.prototype.reduce` which uses the current Promise as it's value.

{% tabs %}
{% tab title="Usage" %}

```typescript
// Count to six but wait 100ms between each step.
const task: Task<unknown, number> = Task.loop(num => {
  if (num > 5) {
    return Task.wait(100).forward(new LoopBreak(num));
  }

  return Task.wait(100).forward(new LoopContinue(num + 1));
}, 1);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type loop = <E, S, T>(
  fn: (currentValue: T) => Task<E, LoopBreak<S> | LoopContinue<T>>,
  initialValue: T
) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## reduce

Works exactly like `Array.prototype.reduce`, but asynchronously. The return value of each reducer must return a Task.

{% tabs %}
{% tab title="Usage" %}

```typescript
// Count to six but wait 100ms between each step.
const task: Task<unknown, number> = Task.reduce(
  sum => Task.succeedIn(100, sum + 1),
  0,
  [1, 2, 3, 4, 5, 6]
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type reduce = <E, T, V>(
  fn: (acc: V, currentValue: T, index: number, original: T[]) => Task<E, V>,
  initialValue: V,
  items: T[]
) => Task<E, V>;
```

{% endtab %}
{% endtabs %}

## zip

Given two tasks, return a new Task which succeeds with a 2-tuple of their successful results.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, string]> = Task.zip(
  Task.of(5),
  Task.of("Hello")
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type zip = <E, E2, S, S2>(
  taskAOrPromise: Task<E, S> | Promise<S>,
  taskBOrPromise: Task<E2, S2> | Promise<S2>
) => Task<E | E2, [S, S2]>;
```

{% endtab %}
{% endtabs %}

## zipWith

Given two tasks, return a new Task which succeeds by running the successful results through a mapping function. Very similar to `map2`, but `zipWith` uses 1 parameter per successful Task. `map2` uses a curried mapping function.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, string]> = Task.zip(
  Task.of(5),
  Task.of("Hello")
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type zip = <E, E2, S, S2>(
  taskAOrPromise: Task<E, S> | Promise<S>,
  taskBOrPromise: Task<E2, S2> | Promise<S2>
) => Task<E | E2, [S, S2]>;
```

{% endtab %}
{% endtabs %}

## flatten

Given a task which succeeds with another task, flatten into a single task which succeeds with the result of that nested task. Often this can be avoided by using `chain`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.flatten(Task.of(Task.of(5)));
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type flatten = <E, S>(task: Task<E, Task<E, S>>) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## ap

The applicative. If you know what that means, you'll be excited. If not, it is fine. This is a low level tool that helps build more complex features.

`ap` starts with a Task which succeeds containing a function. Subsequence compositions of `ap` will each provide a task. The success of all those tasks will be given to the initial task which resulted in a function. This is a type safe way of running `map` on an arbitrary number of tasks. The function specifies its arguments, which must equal the number of `ap` chains. Similar to `Task.all`, but with 1 parameter per task, rather than an array, and it works with different task success types, rather than requiring all tasks succeed with the same type.

Also allows the definition of the mapping function to be asychronous because it is also inside a Task.

Without easy function composition in Javascript, for readability we recommend using the instance version `.ap` rather than the nested calls the pure function requires.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.ap(
  Task.ap(
    Task.ap(
      Task.of((a, b, c) => a + b + c),
      succeed(10) /* a */
    ),
    succeed(50) /* b */
  ),
  succeed(100) /* c */
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type ap = <E, S, S2>(
  taskOrPromise: Task<E, (result: S) => S2> | Promise<(result: S) => S2>,
  appliedTaskOrPromise: Task<E, S> | Promise<S>
) => Task<E, S2>;
```

{% endtab %}
{% endtabs %}
