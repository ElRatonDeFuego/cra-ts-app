import { act, fireEvent, renderHook, waitFor } from "@testing-library/react";
import { rest } from "msw";
import { setupServer } from "msw/node";

// import/no-unused-modules requires non-baseUrl paths
import {
  buildFlickrPhotoURL,
  FlickrBaseURL,
  mockFlickrPhotos,
  mockFlickrResult,
} from "../../../domain/Flickr";

import { useFlickrSearch } from "../useFlickrSearch";

import type { FlickrPhoto } from "../../../domain/Flickr";

/* eslint-disable @typescript-eslint/no-unsafe-assignment */

const InitialResponse = {
  cancelRequest: expect.any(Function),
  displayedResponse: "Please type in a search term above",
  loading: false,
  photo: {},
  runRequest: expect.any(Function),
  search: "",
  setSearch: expect.any(Function),
};

const ResponseAfterSearch = {
  ...InitialResponse,
  search: "foo",
};

const expectedPhoto = {
  title: (mockFlickrPhotos.photos.photo[0] as FlickrPhoto).title,
  URL: buildFlickrPhotoURL(mockFlickrPhotos.photos.photo[0] as FlickrPhoto),
};

const useHookAndSearch = () => {
  const { result } = renderHook(useFlickrSearch);

  act(() => {
    result.current.setSearch("foo");
  });

  expect(result.current).toEqual({
    ...InitialResponse,
    search: "foo",
  });

  return result;
};

const server = setupServer();

// Establish API mocking before all tests.
beforeAll(() => server.listen());

beforeEach(() => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(ctx.status(200), ctx.text(mockFlickrResult))
    )
  );
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

it("should return the correct values when nothing has been typed in yet", () => {
  const { result } = renderHook(useFlickrSearch);

  expect(result.current).toEqual(InitialResponse);
});

describe("test success cases", () => {
  it("should launch the search and process the result", async () => {
    const returnValuesRef = useHookAndSearch();

    await waitFor(() => {
      expect(returnValuesRef.current).toEqual({
        ...ResponseAfterSearch,
        displayedResponse: `Found ${mockFlickrPhotos.photos.total} photos - here's one:`,
        photo: expectedPhoto,
      });
    });
  });

  it("should handle the Escape key", async () => {
    const returnValuesRef = useHookAndSearch();

    await waitFor(() => {
      expect(returnValuesRef.current.photo).toEqual(expectedPhoto);
    });

    fireEvent.keyDown(document, { key: "Escape" });

    await waitFor(() => {
      expect(returnValuesRef.current).toEqual({
        ...ResponseAfterSearch,
        photo: expectedPhoto,
        search: "",
      });
    });
  });
});

it("should handle a network error", async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, _ctx) =>
      res.networkError("Can't connect")
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() =>
    expect(returnValuesRef.current).toEqual({
      ...ResponseAfterSearch,
      displayedResponse: "Network Error",
    })
  );
});

it("should handle an error response", async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) => res.once(ctx.status(404)))
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() =>
    expect(returnValuesRef.current).toEqual({
      ...ResponseAfterSearch,
      displayedResponse: "Request failed with status code 404",
    })
  );
});

const failureResponse = {
  ...ResponseAfterSearch,
  displayedResponse: "Failed to retrieve photos",
};

it("should handle a malformed response", async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(ctx.status(200), ctx.text("jsonFlickrApi()"))
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() => expect(returnValuesRef.current).toEqual(failureResponse));
});

it('should handle a "fail" status', async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(
        ctx.status(200),
        ctx.text(
          `jsonFlickrApi(${JSON.stringify({
            ...mockFlickrPhotos,
            stat: "fail",
          })})`
        )
      )
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() => expect(returnValuesRef.current).toEqual(failureResponse));
});

it('should handle a "0 photos" result', async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(
        ctx.status(200),
        ctx.text(
          `jsonFlickrApi(${JSON.stringify({
            ...mockFlickrPhotos,
            photos: { ...mockFlickrPhotos.photos, total: 0 },
          })})`
        )
      )
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() => {
    expect(returnValuesRef.current).toEqual({
      ...ResponseAfterSearch,
      displayedResponse: "Found 0 photos",
      photo: {},
    });
  });
});

it('should handle a "1 photo" result', async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(
        ctx.status(200),
        ctx.text(
          `jsonFlickrApi(${JSON.stringify({
            ...mockFlickrPhotos,
            photos: { ...mockFlickrPhotos.photos, total: 1 },
          })})`
        )
      )
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() => {
    expect(returnValuesRef.current).toEqual({
      ...ResponseAfterSearch,
      displayedResponse: "Found 1 photo",
      photo: {
        title: (mockFlickrPhotos.photos.photo[0] as FlickrPhoto).title,
        URL: buildFlickrPhotoURL(
          mockFlickrPhotos.photos.photo[0] as FlickrPhoto
        ),
      },
    });
  });
});

it('should return a "Loading.." message for long requests', async () => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res.once(ctx.delay(500), ctx.status(200), ctx.text(mockFlickrResult))
    )
  );

  const returnValuesRef = useHookAndSearch();

  await waitFor(() => {
    expect(returnValuesRef.current).toEqual({
      ...ResponseAfterSearch,
      displayedResponse: "Loading..",
      loading: true,
    });
  });

  act(() => {
    returnValuesRef.current.cancelRequest();
  });

  await waitFor(() => {
    expect(returnValuesRef.current.displayedResponse).not.toEqual("Loading..");
  });
});
