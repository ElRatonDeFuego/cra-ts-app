import { act, render, renderHook, waitFor } from "@testing-library/react";
import { AxiosError, CanceledError } from "axios";
import Joi, { ValidationError } from "joi";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { useRequest } from "./useRequest";

const InitialResponse = {
  cancelRequest: expect.any(Function),
  data: undefined,
  error: undefined,
  loading: false,
  response: undefined,
  runRequest: expect.any(Function),
};

const server = setupServer();

const url = "https://foo.com/mock-request";

// Establish API mocking before all tests.
beforeAll(() => server.listen());

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

it("should return the correct values when no argument was provided and no request was launched", () => {
  const { result } = renderHook(() => useRequest());

  expect(result.current).toEqual(InitialResponse);
});

it("should return the correct values when an empty request is launched", async () => {
  const { result } = renderHook(() => useRequest({ abortOnUnmount: false }));

  act(() => {
    result.current.runRequest();
  });

  await waitFor(() => {
    expect(result.current).toEqual({ ...InitialResponse, loading: true });
  });

  await waitFor(() => {
    expect(result.current).toEqual({
      ...InitialResponse,
      error: expect.any(TypeError), // no URL was provided
    });
  });
});

it("should return the correct values when a successful request is launched", async () => {
  const { result } = renderHook(() => useRequest());

  const data = { bar: 42 };

  const status = 200;

  server.use(
    rest.get(url, (_req, res, ctx) =>
      res.once(ctx.status(status), ctx.json(data))
    )
  );

  act(() => {
    result.current.runRequest({ url });
  });

  await waitFor(() => {
    expect(result.current).toEqual({ ...InitialResponse, loading: true });
  });

  await waitFor(() => {
    expect(result.current.response?.status).toEqual(status);
  });

  expect(result.current).toEqual({
    ...InitialResponse,
    data,
    response: expect.any(Object),
  });
});

it("should handle a manual cancelRequest", async () => {
  const { result } = renderHook(() => useRequest());

  server.use(
    rest.get(url, (_req, res, ctx) =>
      res.once(ctx.delay(2000), ctx.status(200))
    )
  );

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
  server.use(
    rest.get(url, (_req, res, ctx) =>
      res.once(ctx.delay(2000), ctx.status(200))
    )
  );

  let result: ReturnType<typeof useRequest>;

  const TestComponentUsingHook = () => {
    result = useRequest();

    return <></>;
  };

  const { unmount } = render(<TestComponentUsingHook />);

  let error: CanceledError<unknown> | undefined;

  act(() => {
    result.runRequest({ throwOnError: true, url }).catch((err) => {
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
  const { result } = renderHook(() => useRequest());

  server.use(
    rest.get(url, (_req, res, _ctx) => res.networkError("Can't connect"))
  );

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
  const { result } = renderHook(() => useRequest());

  server.use(rest.get(url, (_req, res, ctx) => res.once(ctx.status(404))));

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
  const { result } = renderHook(() => useRequest());

  server.use(rest.get(url, (_req, res, ctx) => res.once(ctx.status(404))));

  const error = new AxiosError("Request failed with status code 404");

  await act(async () => {
    await expect(
      result.current.runRequest({ throwOnError: true, url })
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
  const { result } = renderHook(() => useRequest());

  server.use(
    rest.get(url, (_req, res, ctx) =>
      res.once(ctx.status(200), ctx.json({ baz: 42, foo: "24" }))
    )
  );

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

// to test:
// * useCache use+req
// * axios instance
// * headers use+req
// other useAxios config:
// * autoCancel req
// axios config:
// * method use+req (test a post with data)
// * baseURL use+req
// * params use+req
// * auth use+res
