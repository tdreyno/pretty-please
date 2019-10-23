import { AxiosResponse } from "axios";
import { get } from "../../HTTP/HTTP";
import { fromTask, initialize } from "../RemoteData";

describe("Remote Data", () => {
  test.skip("Test", () => {
    let remoteData = initialize<Error, AxiosResponse<any>>();

    expect(remoteData.type).toBe("Initialized");

    const task = fromTask(get("/endpoint"));

    // remoteData.start();

    expect(remoteData.type).toBe("Pending");

    task.fork(() => void 0, r => (remoteData = r));
  });
});
