import { act, render, renderHook, waitFor } from "@testing-library/react";
import axios, { AxiosError, CanceledError } from "axios";
import { makeUseAxios } from "axios-hooks";
import Joi, { ValidationError } from "joi";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { MissingUrlParamError, useRequest } from "../useRequest";

/* eslint-disable @typescript-eslint/no-floating-promises, @typescript-eslint/no-unsafe-assignment, max-lines */

const InitialResponse = {
  cancelRequest: expect.any(Function),
  data: undefined,
  error: undefined,
  loading: false,
  response: undefined,
  runRequest: expect.any(Function),
};

const mockHttpServer = setupServer();

const baseURL = "https://foo.com";
const data = { bar: 42 };
const relativeURL = "/mock-request";
const status = 200;
const url = `${baseURL}${relativeURL}`;

// Establish API mocking before all tests.
beforeAll(() => mockHttpServer.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => mockHttpServer.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => mockHttpServer.close());

describe("manual requests", () => {
  it("should return the correct values when no argument was provided and no request was launched", () => {
    const { result } = renderHook(() => useRequest({ abortOnUnmount: false }));

    expect(result.current).toEqual(InitialResponse);
  });

  it("should require a non-empty 'url' param for a manual request", async () => {
    const { result } = renderHook(() => useRequest());

    await act(async () => {
      await expect(result.current.runRequest()).rejects.toThrow(
        MissingUrlParamError()
      );
    });
  });

  it("should return the correct values when a successful manual request is launched (w/ URL params)", async () => {
    mockHttpServer.use(
      rest.get(url, (req, res, ctx) =>
        res.once(
          ctx.status(status),
          ctx.json({ data, params: req.url.searchParams.toString() })
        )
      )
    );

    const { result } = renderHook(() => useRequest());

    act(() => {
      result.current.runRequest({
        params: { paramThree: "&" },
        url: encodeURI(`${url}?paramOne=foo&paramTwo`),
      });
    });

    await waitFor(() => {
      expect(result.current).toEqual({ ...InitialResponse, loading: true });
    });

    await waitFor(() => {
      expect(result.current.response?.status).toEqual(status);
    });

    expect(result.current).toEqual({
      ...InitialResponse,
      data: { data, params: "paramOne=foo&paramTwo=&paramThree=%26" },
      response: expect.any(Object),
    });
  });

  // this needs to be a function otherwise it only works once
  const mockHttpHandlerWithTimeout = () =>
    rest.get(url, (_req, res, ctx) =>
      res.once(
        // WARNING below: going over 500 produces a leak w/ msw
        ctx.delay(500),
        ctx.status(200)
      )
    );

  it("should handle a manual cancelRequest", async () => {
    mockHttpServer.use(mockHttpHandlerWithTimeout());

    const { result } = renderHook(() => useRequest());

    act(() => {
      result.current.runRequest({ url });
    });

    await waitFor(() => {
      expect(result.current.loading).toBeTruthy();
    });

    act(() => {
      result.current.cancelRequest();
    });

    await waitFor(() => {
      expect(result.current).toEqual({
        ...InitialResponse,
        error: expect.any(CanceledError),
      });
    });
  });

  it("should trigger a cancelRequest on unmount", async () => {
    mockHttpServer.use(mockHttpHandlerWithTimeout());

    let result: ReturnType<typeof useRequest>;

    const TestComponentUsingHook = () => {
      result = useRequest();

      return <></>;
    };

    const { unmount } = render(<TestComponentUsingHook />);

    let error: CanceledError<unknown> | undefined;

    act(() => {
      result.runRequest({ throwOnCanceled: true, url }).catch((err) => {
        error = err;
      });
    });

    act(unmount);

    await waitFor(() => {
      expect(error).toEqual(new CanceledError("canceled"));
    });

    await waitFor(() => {
      expect(result).toEqual({
        ...InitialResponse,
        loading: true,
      });
    });
  });

  it("should handle a network error", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, _ctx) => res.networkError("Can't connect"))
    );

    const { result } = renderHook(() => useRequest());

    act(() => {
      result.current.runRequest({ url });
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        ...InitialResponse,
        error: new AxiosError("Network Error"),
      })
    );
  });

  it("should handle an error response without throwOnError", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) => res.once(ctx.status(404)))
    );

    const { result } = renderHook(() => useRequest());

    await act(async () => {
      await expect(result.current.runRequest({ url })).resolves.toBeUndefined();
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        ...InitialResponse,
        error: new AxiosError("Request failed with status code 404"),
      })
    );
  });

  it("should handle an error response with throwOnError", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) => res.once(ctx.status(404)))
    );

    const { result } = renderHook(() => useRequest({ url }));

    const error = new AxiosError("Request failed with status code 404");

    await act(async () => {
      await expect(
        result.current.runRequest({ throwOnError: true })
      ).rejects.toThrow(error);
    });

    await waitFor(() =>
      expect(result.current).toEqual({
        ...InitialResponse,
        error,
      })
    );
  });

  it("should validate the response against a Joi schema", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(200), ctx.json({ baz: 42, foo: "24" }))
      )
    );

    const { result } = renderHook(() => useRequest());

    const PositiveIntegerNumberOrZero = Joi.number()
      .strict(true)
      .integer()
      .positive()
      .allow(0);

    const responseSchema = Joi.object({
      baz: PositiveIntegerNumberOrZero.optional(),
      foo: PositiveIntegerNumberOrZero.required(),
    }).strict(true);

    await act(async () => {
      await expect(
        result.current.runRequest({
          responseSchema,
          throwOnError: true,
          url,
        })
      ).rejects.toThrow(
        new ValidationError('"foo" must be a number', undefined, undefined)
      );
    });
  });

  it("should correctly handle useCache on the request", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json(data))
      )
    );

    const { result } = renderHook(() => useRequest({ url }));

    act(() => {
      result.current.runRequest(); // default useCache is false
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data);
    });

    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json({ bar: 48 }))
      )
    );

    act(() => {
      result.current.runRequest({ useCache: true });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data); // cached value
    });

    act(() => {
      result.current.runRequest(); // default useCache is false
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ bar: 48 });
    });
  });

  it("should correctly handle useCache on the hook", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json(data))
      )
    );

    const { result, rerender } = renderHook(useRequest, {
      initialProps: { url, useCache: false },
    });

    act(() => {
      result.current.runRequest();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data);
    });

    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json({ bar: 48 }))
      )
    );

    rerender({ url, useCache: true });

    act(() => {
      result.current.runRequest();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data); // cached value
    });

    rerender({ url, useCache: false });

    act(() => {
      result.current.runRequest();
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ bar: 48 });
    });
  });

  it("should useAxiosInstace", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json(data))
      )
    );

    const useAxiosInstance = makeUseAxios({
      axios: axios.create({ baseURL }),
    });

    const { result } = renderHook(() => useRequest({ useAxiosInstance }));

    act(() => {
      result.current.runRequest({ url: relativeURL });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data);
    });
  });

  it("should use baseURL on the request", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json(data))
      )
    );

    const { result } = renderHook(() => useRequest());

    act(() => {
      result.current.runRequest({
        baseURL,
        url: relativeURL,
      });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data);
    });
  });

  it("should use baseURL on the hook", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) =>
        res.once(ctx.status(status), ctx.json(data))
      )
    );

    const { result } = renderHook(() => useRequest({ baseURL }));

    act(() => {
      result.current.runRequest({ url: relativeURL });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual(data);
    });
  });

  const customHeaders = {
    headers: {
      accept: "application/json, text/plain, */*",
      "x-foo": "X-Bar",
    },
  };

  it("should use the headers provided for the request", async () => {
    mockHttpServer.use(
      rest.get(url, (req, res, ctx) =>
        res.once(ctx.status(status), ctx.json({ headers: req.headers.raw() }))
      )
    );

    const { result } = renderHook(() => useRequest());

    act(() => {
      result.current.runRequest({ headers: { "X-Foo": "X-Bar" }, url });
    });

    await waitFor(() => expect(result.current.data).toEqual(customHeaders));
  });

  it("should use the headers provided for the hook", async () => {
    mockHttpServer.use(
      rest.get(url, (req, res, ctx) =>
        res.once(ctx.status(status), ctx.json({ headers: req.headers.raw() }))
      )
    );

    const { result } = renderHook(() =>
      useRequest({ headers: { "X-Foo": "X-Bar" } })
    );

    act(() => {
      result.current.runRequest({ url });
    });

    await waitFor(() => expect(result.current.data).toEqual(customHeaders));
  });

  it("should handle autoCancel", async () => {
    mockHttpServer.use(
      rest.get(url, (_req, res, ctx) => res(ctx.status(status), ctx.json(data)))
    );

    const { result, rerender } = renderHook(useRequest, {
      initialProps: { autoCancel: true, url },
    });

    let error: Error | undefined;
    let req1Resolved = false;

    const runFirstRequest = () => {
      result.current
        .runRequest({ throwOnCanceled: true })
        .then(() => {
          req1Resolved = true;

          return true;
        })
        .catch((err) => {
          error = err;
        });
    };

    const runSecondRequest = async () => {
      await result.current.runRequest();
    };

    act(runFirstRequest);
    await act(runSecondRequest);

    expect(req1Resolved).toBeFalsy();
    expect(error).toEqual(new CanceledError("canceled"));

    error = undefined;

    rerender({ autoCancel: false, url });

    act(runFirstRequest);
    await act(runSecondRequest);

    expect(req1Resolved).toBeTruthy();
    expect(error).toBeUndefined();
  });

  it("should handle a POST request, with a JSON body", async () => {
    mockHttpServer.use(
      rest.post(url, async (req, res, ctx) =>
        res(ctx.status(status), ctx.json({ body: await req.json() }))
      )
    );

    const { result } = renderHook(() => useRequest());

    const body = { baz: 42, foo: "bar" };

    act(() => {
      result.current.runRequest({ data: body, method: "post", url });
    });

    await waitFor(() => {
      expect(result.current.data).toEqual({ body });
    });
  });
});

describe("automatic requests", () => {
  it("should require a non-empty 'url' param for an automatic request", async () => {
    let result: ReturnType<typeof useRequest>;

    const TestComponentUsingHook = () => {
      // setRequestError will trigger a 'should be wrapped into act'
      // warning, that can't be prevented, event by wrapping into act
      // (which triggers an ESLint error, btw)..
      // Everything works as intended, but with a console.error message
      result = useRequest({ manual: false, url: "" });

      return <></>;
    };

    render(<TestComponentUsingHook />);

    await waitFor(() => {
      expect(result).toEqual({
        ...InitialResponse,
        error: MissingUrlParamError(),
      });
    });
  });

  it("should return the correct values when a successful automatic request is launched (w/ URL params)", async () => {
    mockHttpServer.use(
      rest.get(url, (req, res, ctx) =>
        res.once(
          ctx.status(status),
          ctx.json({ data, params: req.url.searchParams.toString() })
        )
      )
    );

    let result: ReturnType<typeof useRequest>;

    const TestComponentUsingHook = () => {
      result = useRequest({
        manual: false,
        params: { paramThree: "&" },
        url: encodeURI(`${url}?paramOne=foo&paramTwo`),
      });

      return <></>;
    };

    render(<TestComponentUsingHook />);

    await waitFor(() => {
      expect(result).toEqual({
        ...InitialResponse,
        loading: true,
      });
    });

    await waitFor(() => {
      expect(result.response?.status).toEqual(status);
    });

    await waitFor(() => {
      expect(result).toEqual({
        ...InitialResponse,
        data: { data, params: "paramOne=foo&paramTwo=&paramThree=%26" },
        response: expect.any(Object),
      });
    });
  });
});

// timeouts are currently not testable using msw
// see https://github.com/mswjs/msw/issues/1187
