# Task

The `Task` class is the core of this library. Below are all the methods that can be called on a task. To create a new task, refer to [Creating Tasks](docs/task-static.md).

## cancel

Cancels a task, meaning it will never complete.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task = Task.of(5).cancel();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type cancel = () => void;
```

{% endtab %}
{% endtabs %}

## map

Given a task, when it has _succeeded_, pass the value through a mapping function.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5).map(number => number * 2);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type map = <S2>(fn: (result: S) => S2) => Task<E, S2>;
```

{% endtab %}
{% endtabs %}

## mapError

Given a task, when it has _failed_, pass the error through a mapping function to produce a different failed Task.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.fail(5).mapError(number => number * 2);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type mapError = <E2>(fn: (error: E) => E2) => Task<E2, S>;
```

{% endtab %}
{% endtabs %}

## mapBoth

Given a task, provide mapping functions for both the success and fail states. Results in a new task which has the type of the two mapping function results.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<Error, number> = Task.of(5).mapBoth(
  () => new Error("Surprising Error"),
  number => number * 2
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type mapBoth = <E2, S2>(
  handleError: (error: E) => E2,
  handleSuccess: (success: S) => S2
) => Task<E2, S2>;
```

{% endtab %}
{% endtabs %}

## chain

Given a task, chain a subsequent task to run after the initial task has succeeded.

In general, users have difficulty understanding the difference between `chain` and `map`. The key is to look at the types. `chain` recieves a value and returns a `Task`. This allows chaining of asynchronous tasks.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5).chain(number =>
  Task.of(number * 2)
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type chain = <S2>(fn: (result: S) => Task<E, S2> | Promise<S2>) => Task<E, S2>;
```

{% endtab %}
{% endtabs %}

## wait

Given a task, wait some number of milliseconds to forward the successful value. Errors still propagate immediately.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5).wait(2000);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type wait = (ms: number) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## retryIn

Given a failing task, wait some number of seconds and attempt to retry it. Useful for network-related tasks.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, Response> = Task.fromLazyPromise(() =>
  fetch(URL)
).retryIn(2000);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type retryIn = (ms: number) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## retryWithExponentialBackoff

Given a task, continue to retry it some number of times. The time between each attempt increases exponentially. Useful for network-related tasks.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, Response> = Task.fromLazyPromise(() =>
  fetch(URL)
).retryWithExponentialBackoff(2000, 5);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type retryWithExponentialBackoff = (ms: number, times: number) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## flatten

Given a task which succeeds with another task, flatten into a single task which succeeds with the result of that nested task. Often this can be avoided by using `chain`.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(Task.of(5)).flatten();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type flatten = <S2>(this: Task<E, Task<E, S2>>) => Task<E, S2>;
```

{% endtab %}
{% endtabs %}

## orElse

Given a task that fails, a function can be called to attempt a recovery. This is like `chain`, but handles the error case instead of the success.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<string, string> = Task.fail("Error").orElse(() =>
  Task.of("Success")
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type orElse = <S2>(
  fn: (error: E) => Task<E, S | S2> | Promise<S | S2>
) => Task<E, S | S2>;
```

{% endtab %}
{% endtabs %}

## fold

Given a task, provide a function to convert each of the success or error states to a value of the same type. Useful for React where you want to choose between rendering JSX that states the error or rendering JSX which shows the data.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, JSX> = Task.fromPromise(fetch(URL)).fold(
  () => <h1>Error</h1>,
  data => <h1>Worked: ${data}</h1>
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type fold = <R>(
  handleError: (error: E) => R,
  handleSuccess: (success: S) => R
) => Task<unknown, R>;
```

{% endtab %}
{% endtabs %}

## tap

Given a task, pass the success value to the tap (like tapping a tree or process) to perform some side-effect. Regardless of the return value of the tap, the original success value flows through to the next step.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5).tap(num =>
  console.log("Got", num)
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type tap = (fn: (result: S) => void) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## tapChain

Given a task, pass the success value to the tap (like tapping a tree or process) to perform some side-effect. Regardless of the return value of the tap, the original success value flows through to the next step.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5).tap(num =>
  console.log("Got", num)
);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type tapChain = <S2>(
  fn: (result: S) => Task<E, S2> | Promise<S2>
) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## onlyOnce

By default, tasks are run (forked) whenever a downstream function asks for the result. This means if two pieces of code use (or chain from) the same task, it will execute twice. If you want to share the successful result, basically caching it, `onlyOnce` will create a task that can be shared.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, Response> = Task.fromLazyPromise(() =>
  fetch(URL)
).onlyOnce();

// Only loads data from network once.
for (let i = 0; i < 5, i++) {
  task.fork(
    () => console.error("Error"),
    resp => console.log(resp)
  );
}
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type onlyOnce = () => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## succeedIf

Like `onlyOnce`, but provides a function which can arbitrarily check whether the task has succeeded. Useful for building tasks off of global state and side effects.

{% tabs %}
{% tab title="Usage" %}

```typescript
// Succeed until some unknown date.
const task: Task<unknown, number> = Task.of(5).succeedIf(() => Date.now() < x);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type succeedIf = (fn: () => S | undefined) => Task<E, S>;
```

{% endtab %}
{% endtabs %}

## toPromise

Converts a task to a Promise. Useful for integrating with other libraries.

{% tabs %}
{% tab title="Usage" %}

```typescript
const promise: Promise<number> = Task.of(5).toPromise();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type toPromise = () => Promise<S>;
```

{% endtab %}
{% endtabs %}

## swap

Swaps the error and success values so the old error message in the new success and vice versa. Useful in the rare case where the error is actually the expected outcome.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of(5);
const swapped: Task<number, unknown> = task.swap();
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type swap = () => Task<S, E>;
```

{% endtab %}
{% endtabs %}

## forward

Given a successful Task, throw away the result and continue the chain with a new value. Useful for injecting singleton or constant values in place of null/void success values.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, string> = Task.of(5).forward(() => "Hello");
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type forward = <S2>(value: S2) => Task<E, S2>;
```

{% endtab %}
{% endtabs %}

## append

Given a successful Task, join it before an additional value. Useful for threading a value along with a task. Like `zip`, but when one of the values is not a Task.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, number]> = Task.of(5).append(10);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type append = <S2>(this: Task<E, S>, value: S2) => Task<E, [S, S2]>;
```

{% endtab %}
{% endtabs %}

## prepend

Given a successful Task, join it after an additional value. Useful for threading a value along with a task. Like `zip`, but when one of the values is not a Task.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, [number, number]> = Task.of(5).prepend(10);
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type prepend = <S2>(this: Task<E, S>, value: S2) => Task<E, [S2, S]>;
```

{% endtab %}
{% endtabs %}

## ap

The applicative. If you know what that means, you'll be excited. If not, it is fine. This is a low level tool that helps build more complex features.

`ap` starts with a Task which succeeds containing a function. Subsequence chains of `ap` will each provide a task. The success of all those tasks will be given to the initial task which resulted in a function. This is a type safe way of running `map` on an arbitrary number of tasks. The function specifies its arguments, which must equal the number of `ap` chains. Similar to `Task.all`, but with 1 parameter per task, rather than an array, and it works with different task success types, rather than requiring all tasks succeed with the same type.

Also allows the definition of the mapping function to be asychronous because it is also inside a Task.

{% tabs %}
{% tab title="Usage" %}

```typescript
const task: Task<unknown, number> = Task.of((a, b, c) => a + b + c)
  .ap(succeed(10)) // a
  .ap(succeed(50)) // b
  .ap(succeed(100)); // c
```

{% endtab %}

{% tab title="Type Definition" %}

```typescript
type ap = <E2, S2, S3 = S extends (arg: S2) => any ? ReturnType<S> : never>(
  taskOrPromise: Task<E | E2, S2> | Promise<S2>
) => Task<E | E2, S3>;
```

{% endtab %}
{% endtabs %}
