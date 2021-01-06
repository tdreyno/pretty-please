import { all, of, Task } from "../Task/Task"
import { pairsToIndexedObject } from "../util"

const editors = ["1", "2", "3"]

const loadUserName = (id: string): Promise<[string, string]> =>
  Promise.resolve([id, "name"])

const loadUserNameTask = (id: string): Task<never, [string, string]> =>
  of([id, "name"])

const editorTuplesToMap = <R extends { [userId: string]: string }>(
  results: Array<[string, string | undefined]>,
): R =>
  results
    .filter(([, userName]) => userName)
    .reduce(pairsToIndexedObject, {} as R)

describe("more test", () => {
  test("Promises", async () => {
    await Promise.all(editors.map(loadUserName)).then(editorTuplesToMap)
  })

  test("Tasks", () => {
    of(editors)
      .chain(ids => all(ids.map(loadUserNameTask)))
      .map(editorTuplesToMap)
      .fork(jest.fn(), jest.fn())
  })
})
