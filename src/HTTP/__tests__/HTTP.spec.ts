import mockAxios, { AxiosResponse } from "axios";
import { all, fail, succeed, Task } from "../../Task/Task";
import { get, toJSON } from "../HTTP";

describe("HTTP", () => {
  test("Returns many JSON", async () => {
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

    function getUser(id: string) {
      return (userTasks[id] =
        userTasks[id] ||
        get(`/users/${id}`)
          .andThen(toJSON)
          .andThen(toUser)
          .onlyOnce());
    }

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

    const users = await all([
      getUser("1"),
      getUser("1"),
      getUser("1"),
      getUser("2"),
      getUser("2"),
      getUser("2"),
      getUser("3"),
      getUser("3"),
      getUser("3")
    ]).toPromise();

    expect(load).toBeCalledTimes(3);
    expect(users[0]).toBe(users[1]);
  });
});

describe("toJSON", () => {
  test("valid text response should resolve with JSON", () => {
    toJSON({
      data: JSON.stringify({ name: "Test" }),
      config: {
        responseType: "text"
      }
    } as AxiosResponse<string>).fork(jest.fn(), result => {
      expect((result as any).name).toBe("Test");
    });
  });

  test("invalid text response should resolve with JSON", () => {
    toJSON({
      data: "Not JSON",
      config: {
        responseType: "text"
      }
    } as AxiosResponse<string>).fork(err => {
      expect(err).toBeInstanceOf(SyntaxError);
    }, jest.fn());
  });

  test("json response should resolve with JSON", () => {
    toJSON({
      data: { name: "Test" },
      config: {
        responseType: "json"
      }
    } as AxiosResponse<any>).fork(jest.fn(), result => {
      expect((result as any).name).toBe("Test");
    });
  });

  test("invalid response should resolve with error", () => {
    toJSON({
      data: 0b0001,
      config: {
        responseType: "blob"
      }
    } as AxiosResponse<any>).fork(err => {
      expect(err.message).toBe("Invalid data");
    }, jest.fn());
  });
});
