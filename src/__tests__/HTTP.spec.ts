import mockAxios, { AxiosResponse } from "axios";
import { get, toJSON } from "../HTTP";
import { all, fail, succeed, Task } from "../Task";

interface User {
  id: string;
  name: string;
}

function toUser(data: any): Task<Error, User> {
  if (
    data &&
    data.id &&
    typeof data.id === "string" &&
    data.name &&
    typeof data.name === "string"
  ) {
    return succeed<User, Error>({ id: data.id, name: data.name });
  }

  return fail(new Error("JSON was not a user"));
}

const userTasks: {
  [id: string]: Task<Error, User>;
} = {};

function getUser(id: string): Task<Error, User> {
  if (!userTasks[id]) {
    return (userTasks[id] = get(`/users/${id}`)
      .andThen(toJSON)
      .andThen(toUser));
  }

  return userTasks[id];
}

describe("HTTP", () => {
  test.skip("Tests", async () => {
    const load = jest.fn();

    (mockAxios.get as any).mockImplementation(async (url: string) => {
      const id = url.split("/").reverse()[0];

      load(id);

      return {
        data: JSON.stringify({ id, name: `Test ${id}` }),
        config: {
          responseType: "text"
        }
      } as AxiosResponse<string>;
    });

    expect(getUser("1")).toBe(getUser("1"));

    const users = await all(
      getUser("1"),
      getUser("1"),
      getUser("2"),
      getUser("2"),
      getUser("3"),
      getUser("3")
    ).toPromise();

    // console.log(users);
    expect(load).toBeCalledTimes(3);
    expect(users[0]).toBe(users[1]);
  });
});
