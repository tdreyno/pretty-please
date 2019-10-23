import { all, of, Task } from "../Task/Task";

const editors = ["1", "2", "3"];

function loadUserName(id: string): Promise<[string, string]> {
  return Promise.resolve([id, "name"]);
}

function loadUserNameTask(id: string): Task<Error, [string, string]> {
  return of([id, "name"]);
}

function editorTuplesToMap(
  results: Array<[string, string]>
): { [userId: string]: string } {
  return results.reduce(
    (sum, [userId, userName]) => {
      if (userName) {
        sum[userId] = userName;
      }

      return sum;
    },
    {} as { [userId: string]: string }
  );
}

describe("more test", () => {
  test("Promises", async () => {
    await Promise.all(editors.map(loadUserName)).then(editorTuplesToMap);
  });

  test("Tasks", () => {
    of(editors)
      .map(ids => ids.map(loadUserNameTask))
      .andThen(all)
      .map(editorTuplesToMap)
      .fork(jest.fn(), jest.fn());
  });
});
