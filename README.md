# Pretty Please

[![Test Coverage](https://api.codeclimate.com/v1/badges/bade509a61c126d7f488/test_coverage)](https://codeclimate.com/github/tdreyno/pretty-please/test_coverage)
[![npm latest version](https://img.shields.io/npm/v/@tdreyno/pretty-please/latest.svg)](https://www.npmjs.com/package/@tdreyno/pretty-please)

Pretty Please is a TypeScript library that provides Tasks as an alternative to [Promises](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise). Tasks are a common solution to asynchronicity (see Prior Art below) and can be used in place of Promises. They differ from Promises in several ways.

## Lazy Execution

Tasks provide lazy execution. Tasks do not start running until some piece of code uses the result of the Task. This means that if the value is never used, the computation and loading never happens. Promises always start in a "pending" state, making it difficult to control them externally.

## Cancellation

Tasks can be cancelled. Promises can not. This means that when you are loading data and you navigate away from the page, you can stop the asynchronous requests. Often with Promises, you will see them complete long after they are needed (especially when quickly moving through a single page web app).

## Better Error Handling

Promises do not track what kind of errors can be thrown by the Promise. The type of Promise in TypeScript is `Promise<T>`. It only knows or cares about the successful result type. The type of Task is `Task<E, T>`, where `E` is the expected error type of the task. In Pretty Please, we force you to deal with errors up front. All functions and types which interact with tasks put the error handling before the success handling.

Asynchronous programming is difficult and error prone. We must be constantly thinking about how processes can fail.

## Functions should accomplish 1 thing

It is difficult to understand how the `Promise.prototype.then` and `Promise.prototype.catch` methods of Promise work. This is because they accomplish more than one thing and work differently depending on how they are used.

`Promise.prototype.then` provides success **and** error handling. It also provides the ability to chain both successes and errors to either realized values or to a pending Promise.

Tasks provide separate methods (with their own types) for each use case:

- `map` transforms successful tasks by running a mapping function on the value. Similar to `Promise.prototype.then` when returning a realized value.
- `mapError` transforms an error from one type to another. This would require `Promise.prototype.then` to return a `Promise.reject`.
- `mapBoth` does both at once.
- `chain` takes a successful task and chains it to the next asynchronous action. Similar to `Promise.prototype.then` where the return value is a pending Promise.
- `tap` and `log` allow looking (or logging) the success value without transforming it.
- and there are many more.

`Promise.prototype.catch` allows for not just error handling and logging, but also for recovery. Developers often accidently turn a failing Promise into a successful one by attempting to insert error logging.

## Convenience Methods

Back in the day, before Promises were in Javascript, I used Bluebird.js for asynchronous code (maybe you did too). If you take a look at [their API](http://bluebirdjs.com/docs/api-reference.html), you'll see nearly 40 different methods of dealing with Promises. And yet, when Promises became standardized we lost almost all of these. Helpers like `Promise.race` and `Promise.prototype.finally` have only made their way into the language recently.

Working with asynchronicity requires that our approaches and functions provide readable code. Promises force almost all code to be inside `Promise.prototype.then` blocks whose intention is difficult to scan.

Pretty Please provides dozens of well-named helper methods to make sure your logic is readable and scannable. We also provide tools for error recovery such as `retryIn`. This attempts to recover failing Tasks by retrying them after waiting some number of milliseconds.

## async/await

I believe that most Javascript programmers have a hard time working with Promises. That's actually okay. Asynchronous programming is hard. The web platform has introduced `async`/`await` in an attempt to improve the situation. I believe that this was actually a mistake. `async`/`await` makes asynchronous programming \*_look_ easy. But it distances the programmer from the complexity of the system.

_Side bar: here come the generalizations. I'm sure you are a smart programmer and you never make these mistakes, but I have reviewed hundreds of Javascript programmers code and I see this repeated often._

Many tasks which are parallelizable end up becoming serial when converted to `async`/`await`. The paradigm wants us to think imperatively and linearly, which does not match up well to parallelizable asynchronicity.

For integration purposes, Tasks can be `await`ed just like Promises. If you have a large `async`/`await` codebase, using Tasks will look exactly like using Promises.

## Code Comparison

Here's a quick example that might seem complicated, but is actually a very simple problem programmers encounter.

Imagine a site which works like Github. There are Users who have Projects. Those users also have Friends. Those Friends have Projects. There are also global Notifications.

Load all the Projects that the User can access (both theirs and their friends) and load the notifications.

### Promises

The following can be written using Promises and it is both readable and performant. However it is not lazy and if it were written using `async`/`await`, the parallelism would likely be omitted.

```typescript
function Loader(
  user: User,
  notificationsApi: NotificationsAPI,
): Promise<Result> {
  return Promise.all([
    notificationsApi.getMessages(),

    Promise.all([
      user.getProjects(),

      user
        .getFriends()
        .then(friends =>
          Promise.all(friends.map(friend => friend.getProjects())).then(
            flatten,
          ),
        ),
    ]).then(([myProjects, friendsProjects]) =>
      myProjects.concat(friendsProjects).map(project => project.name),
    ),
  ]).then(([notifications, projectNames]) => ({
    projectNames,
    notifications,
  }))
}
```

### Tasks

It is important to remember that this is all lazy. So until the data is used to render the page, the request does not start.

```typescript
function Loader(
  user: User,
  notificationsApi: NotificationsAPI,
): Task<Error, Result> {
  return Task.map3(
    notifications => myProjects => friendsProjects => ({
      notifications,

      projectNames: myProjects
        .concat(friendsProjects)
        .map(project => project.name),
    }),

    // Get Notifications
    notificationsApi.getMessages(),

    // Get My Projects
    user.getProjects(),

    // Get My Friends Projects
    user
      .getFriends()
      .map(friends => friends.map(friend => friend.getProjects()))
      .chain(Task.all)
      .map(flatten),
  )
}
```

## Installation

### Yarn

```sh
yarn add @tdreyno/pretty-please
```

### NPM

```sh
npm install --save @tdreyno/pretty-please
```

## Prior Art

Many languages handle asynchronicity in this way. Elm provides [Tasks](https://package.elm-lang.org/packages/elm/core/latest/Task), so does [Java](https://docs.oracle.com/javase/7/docs/api/java/util/concurrent/Future.html), [C#](https://docs.microsoft.com/en-us/cpp/parallel/concrt/walkthrough-implementing-futures) and [F#](https://medium.com/@dagbrattli/asynchronicity-in-f-eb4c952f0035).

Rust uses [Futures](https://docs.rs/futures), along with [Scala](https://docs.scala-lang.org/overviews/core/futures.html).

[fp-ts](https://github.com/gcanti/fp-ts/blob/master/src/Task.ts) is a popular TypeScript library which implements functional concepts.

## License

Pretty Please is licensed under the Hippocratic License. It is an [Ethical Source license](https://ethicalsource.dev) derived from the MIT License, amended to limit the impact of the unethical use of open source software.
