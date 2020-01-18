import { all, of, Task } from "../Task/Task";
import { pairsToIndexedObject } from "../util";

const editors = ["1", "2", "3"];

function loadUserName(id: string): Promise<[string, string]> {
  return Promise.resolve([id, "name"]);
}

function loadUserNameTask(id: string): Task<Error, [string, string]> {
  return of([id, "name"]);
}

function editorTuplesToMap<R extends { [userId: string]: string }>(
  results: Array<[string, string | undefined]>
): R {
  return results
    .filter(([_, userName]) => userName)
    .reduce(pairsToIndexedObject, {} as R);
}

describe("more test", () => {
  test("Promises", async () => {
    await Promise.all(editors.map(loadUserName)).then(editorTuplesToMap);
  });

  test("Tasks", () => {
    of(editors)
      .chain(ids => all(ids.map(loadUserNameTask)))
      .map(editorTuplesToMap)
      .fork(jest.fn(), jest.fn());
  });
});
