import axios, { AxiosRequestConfig, AxiosResponse } from "axios";
import { fail, fromPromise, succeed, Task } from "./Task";

export function get<T = any, R = AxiosResponse<T>>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.get(url, config));
}

export function delete_<T = any, R = AxiosResponse<T>>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.delete(url, config));
}

export function head<T = any, R = AxiosResponse<T>>(
  url: string,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.head(url, config));
}

export function post<T = any, R = AxiosResponse<T>>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.post(url, data, config));
}

export function put<T = any, R = AxiosResponse<T>>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.put(url, data, config));
}

export function patch<T = any, R = AxiosResponse<T>>(
  url: string,
  data?: any,
  config?: AxiosRequestConfig
): Task<Error, R> {
  return fromPromise<R, Error>(axios.patch(url, data, config));
}

export function toJSON<S, T>(resp: AxiosResponse<T>): Task<Error, S> {
  const type = resp.config ? resp.config.responseType : "text";

  switch (type) {
    case "json":
      return succeed((resp.data as unknown) as S);

    case "text":
      try {
        return succeed(JSON.parse((resp.data as unknown) as string));
      } catch (e) {
        return fail(e);
      }

    default:
      return fail(new Error("Invalid data"));
  }
}
