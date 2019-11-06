# Pretty Please

Pretty Please is a TypeScript library provides Tasks an alternative to Promises.

Documentation of this project is a work in progress. For now, take a look at the example below and lean heavily on TypeScript's information around the public API.

## Installation

### Yarn

```sh
yarn add @tdreyno/pretty-please
```

### NPM

```sh
npm install --save @tdreyno/pretty-please
```

## Examples

```typescript
import { HTTP } from "@tdreyno/pretty-please";

const getFriendsNames = id =>
  HTTP
    // Load data.
    .get(`/user/${id}.json`)

    // Parse JSON text into valid Person type.
    .andThen(parseUserData)

    // Load all of a user's friends in parallel.
    .andThen(user =>
      user.friends
        .map(id => HTTP.get(`/user/${id}.json`).andThen(parseUserData))
        .andThen(Task.all)
    )

    // Map to an array of friend's names.
    .map(friends => friends.map(f => f.name));

// Prepares the task, but does not run anything.
const task = getFriendsNames(1);

// Run the task.
task.fork(e => console.error(e), names => console.log("Friend names", names));
```

## License

Pretty Please is licensed under the the Hippocratic License. It is an [Ethical Source license](https://ethicalsource.dev) derived from the MIT License, amended to limit the impact of the unethical use of open source software.
