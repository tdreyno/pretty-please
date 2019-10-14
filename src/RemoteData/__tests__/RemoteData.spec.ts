import { AxiosResponse } from "axios";
import { get } from "../../HTTP";
import { fromTask, initialize } from "../RemoteData";

describe.only("Remote Data", () => {
  test("Test", () => {
    let remoteData = initialize<Error, AxiosResponse<any>>();

    expect(remoteData.type).toBe("Initialized");

    const task = fromTask(get("/endpoint"));

    // remoteData.start();

    expect(remoteData.type).toBe("Pending");

    task.fork(() => void 0, r => (remoteData = r));
  });
});
