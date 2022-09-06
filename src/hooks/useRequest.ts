import { CanceledError } from "axios";
import useAxios from "axios-hooks";
import { ValidationError } from "joi";
import { useCallback, useMemo, useState } from "react";
import { useEffectOnMountOrUnmount } from "hooks/useEffectOnMountOrUnmount";

import type { ManualRequestParams, UseRequestParams } from "./useRequestTypes";
import type { AxiosError } from "axios";

export type { ManualRequestParams, UseRequestParams };

// in a const to prevent re-renders due to new object refs
const DefaultHeaders = {
  "Content-Type": "application/json",
};

const DefaultTimeout = 2 * 60 * 1000; // default to 2mn

export const MissingUrlParamError = () => new Error("'url' is required");

export const useRequest = <
  ResponseDataType = unknown,
  PayloadBodyType = unknown
>(
  {
    abortOnUnmount = true,
    headers = DefaultHeaders,
    manual = true,
    responseSchema,
    throwOnCanceled = false,
    throwOnError = false,
    timeout = DefaultTimeout,
    url,
    useAxiosInstance,
    useCache = false,
    ...axiosConfigAndOptions
  }: UseRequestParams<ResponseDataType, PayloadBodyType> = {
    abortOnUnmount: true,
    headers: DefaultHeaders,
    manual: true,
    throwOnCanceled: false,
    throwOnError: false,
    timeout: DefaultTimeout,
    url: "",
    useCache: false,
  }
  // eslint-disable-next-line sonarjs/cognitive-complexity
) => {
  const [requestError, setRequestError] = useState<
    CanceledError<ResponseDataType> | ValidationError | Error
  >();

  useMemo(() => {
    if (!manual && (url === undefined || url === "")) {
      setRequestError(MissingUrlParamError());
    }
  }, [manual, url]);

  const [
    { data, error: axiosError, loading, response },
    runAxiosRequest,
    cancelRequest,
  ] = (useAxiosInstance ?? useAxios)<
    ResponseDataType,
    PayloadBodyType,
    ResponseDataType
  >(
    {
      headers,
      timeout,
      ...(url !== undefined && url !== "" ? { url } : {}),
      ...axiosConfigAndOptions,
    },
    { manual, useCache, ...axiosConfigAndOptions }
  );

  const runRequest = useCallback(
    <
      RequestResponseDataType extends ResponseDataType = ResponseDataType,
      RequestPayloadBodyType extends PayloadBodyType = PayloadBodyType
    >({
      headers: headersForRequest = headers,
      responseSchema: responseSchemaForRequest = responseSchema,
      throwOnCanceled: throwOnCanceledForRequest = throwOnCanceled,
      throwOnError: throwOnErrorForRequest = throwOnError,
      timeout: timeoutForRequest = timeout,
      url: urlForRequest = url,
      useCache: useCacheForRequest = useCache,
      ...axiosRequestConfig
    }: ManualRequestParams<
      RequestResponseDataType,
      RequestPayloadBodyType
    > = {}) => {
      if (!(urlForRequest !== undefined && urlForRequest !== "")) {
        const error = MissingUrlParamError();

        setRequestError(error);

        return Promise.reject(error);
      }

      return runAxiosRequest(
        {
          headers: headersForRequest,
          timeout: timeoutForRequest,
          url: urlForRequest,
          ...axiosRequestConfig,
        },
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

          if (
            (reqError instanceof CanceledError && throwOnCanceledForRequest) ||
            (!(reqError instanceof CanceledError) && throwOnErrorForRequest)
          ) {
            throw reqError;
          }
        }) as Promise<RequestResponseDataType | undefined>;
    },
    [
      headers,
      responseSchema,
      runAxiosRequest,
      setRequestError,
      throwOnCanceled,
      throwOnError,
      timeout,
      url,
      useCache,
    ]
  );

  useEffectOnMountOrUnmount({
    ...(abortOnUnmount ? { onUnmount: cancelRequest } : {}),
  });

  const error = (axiosError ?? requestError) as
    | AxiosError<ResponseDataType, PayloadBodyType>
    | CanceledError<ResponseDataType>
    | ValidationError
    | Error
    | undefined;

  return {
    cancelRequest,
    data,
    error,
    loading: error ? false : loading,
    response,
    runRequest,
  };
};
