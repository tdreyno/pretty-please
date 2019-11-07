import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { fail, fromPromise, succeed, succeedBy, Task } from "../Task/Task";

export function get<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.get(url, config));
}

/* istanbul ignore next */
export function delete_<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.delete(url, config));
}

/* istanbul ignore next */
export function head<T = any>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.head(url, config));
}

/* istanbul ignore next */
export function post<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.post(url, data, config));
}

/* istanbul ignore next */
export function put<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.put(url, data, config));
}

/* istanbul ignore next */
export function patch<T = any>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, AxiosResponse<T>> {
  return fromPromise<AxiosResponse<T>, Error>(axios.patch(url, data, config));
}

export function toJSON<S, T>(resp: AxiosResponse<T>): Task<Error, S> {
  const type = resp.config ? resp.config.responseType : "text";

  switch (type) {
    case "json":
      return succeed((resp.data as unknown) as S);

    case "text":
      return succeedBy(() => JSON.parse((resp.data as unknown) as string));

    default:
      return fail(new Error("Invalid data"));
  }
}
