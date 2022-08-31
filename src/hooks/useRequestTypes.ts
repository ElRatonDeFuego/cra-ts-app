/* istanbul ignore file */

import type { AxiosRequestConfig } from "axios";
import type { Options, RefetchOptions } from "axios-hooks";
import type useAxios from "axios-hooks";
import type * as joi from "joi";

type CommonParams<PayloadBodyType> = AxiosRequestConfig<PayloadBodyType> &
  RefetchOptions;

interface ManualRequetSpecificParams<ResponseDataType> {
  responseSchema?: joi.Schema<ResponseDataType>;
  throwOnCanceled?: boolean;
  throwOnError?: boolean;
}

export type ManualRequestParams<ResponseDataType, PayloadBodyType> =
  CommonParams<PayloadBodyType> & ManualRequetSpecificParams<ResponseDataType>;

type AutomaticUseRequestParams<ResponseDataType> = {
  manual?: false;
  url: string;
} & {
  [Property in keyof ManualRequetSpecificParams<ResponseDataType>]: never;
};

type ManualUseRequestParams<ResponseDataType> = {
  manual?: true;
} & ManualRequetSpecificParams<ResponseDataType>;

export type UseRequestParams<
  ResponseDataType = unknown,
  PayloadBodyType = unknown
> = CommonParams<PayloadBodyType> &
  Omit<Options, "manual"> & {
    abortOnUnmount?: boolean;
    useAxiosInstance?: typeof useAxios;
  } & (
    | AutomaticUseRequestParams<ResponseDataType>
    | ManualUseRequestParams<ResponseDataType>
  );
