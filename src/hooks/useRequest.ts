import { AxiosError, AxiosRequestConfig, CanceledError } from "axios";
import useAxios from "axios-hooks";
import { useEffectOnMountOrUnmount } from "hooks/useEffectOnMountOrUnmount";
import { ValidationError } from "joi";
import { useCallback, useState } from "react";

import type { Options, RefetchOptions } from "axios-hooks";
import type * as joi from "joi";

// in a const to prevent re-renders due to new object refs
const defaultHeaders = {
  "Content-Type": "application/json",
};

export const useRequest = <T>({
  abortOnUnmount = true,
  headers = defaultHeaders,
  responseSchema,
  timeout = 2 * 60 * 1000, // default to 2mn
  throwOnError = false,
  useAxiosInstance,
  useCache = false,
  ...axiosConfigAndOptions
}: AxiosRequestConfig<T> &
  Omit<Options, "manual"> & {
    abortOnUnmount?: boolean;
    responseSchema?: joi.Schema;
    throwOnError?: boolean;
    useAxiosInstance?: typeof useAxios;
  } = {}) => {
  const [requestError, setRequestError] = useState<
    CanceledError<T> | ValidationError
  >();

  const [
    { data, error: axiosError, loading, response },
    runAxiosRequest,
    cancelRequest,
  ] = (useAxiosInstance ?? useAxios)<T>(
    {
      headers,
      timeout,
      ...axiosConfigAndOptions,
    },
    { manual: true, useCache, ...axiosConfigAndOptions }
  );

  const runRequest = useCallback(
    ({
      headers: headersForRequest = headers,
      responseSchema: responseSchemaForRequest = responseSchema,
      throwOnError: throwOnErrorForRequest = throwOnError,
      timeout: timeoutForRequest = timeout,
      useCache: useCacheForRequest = useCache,
      ...axiosRequestConfig
    }: AxiosRequestConfig<T> &
      RefetchOptions & {
        responseSchema?: joi.Schema;
        throwOnError?: boolean;
      } = {}) =>
      runAxiosRequest(
        { headers, timeout, ...axiosRequestConfig },
        {
          useCache: useCacheForRequest,
        }
      )
        .then((axiosResponse) => {
          if (responseSchemaForRequest) {
            return responseSchemaForRequest.validateAsync(axiosResponse.data);
          }

          return axiosResponse;
        })
        .catch((reqError) => {
          if (
            reqError instanceof CanceledError ||
            reqError instanceof ValidationError
          ) {
            setRequestError(reqError);
          }

          if (throwOnErrorForRequest) {
            throw reqError;
          }
        }),
    [
      headers,
      responseSchema,
      runAxiosRequest,
      setRequestError,
      throwOnError,
      timeout,
      useCache,
    ]
  );

  useEffectOnMountOrUnmount({
    ...(abortOnUnmount ? { onUnmount: cancelRequest } : {}),
  });

  const error = (axiosError ?? requestError) as
    | AxiosError<T, T>
    | CanceledError<T>
    | ValidationError;

  return {
    cancelRequest,
    data,
    error,
    loading: error ? false : loading,
    response,
    runRequest,
  };
};
