import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {
  buildFlickrPhotoURL,
  FlickrBaseURL,
  mockFlickrPhotos,
  mockFlickrResult,
} from "domain/Flickr";
import { rest } from "msw";
import { setupServer } from "msw/node";
import { FlickrSearch } from "../FlickrSearch";

import type { FlickrPhoto } from "domain/Flickr";

const server = setupServer();

// Establish API mocking before all tests.
beforeAll(() => server.listen());

beforeEach(() => {
  server.use(
    rest.get(FlickrBaseURL, (_req, res, ctx) =>
      res(ctx.delay(200), ctx.status(200), ctx.text(mockFlickrResult))
    )
  );
});

// Reset any request handlers that we may add during the tests,
// so they don't affect other tests.
afterEach(() => server.resetHandlers());

// Clean up after the tests are finished.
afterAll(() => server.close());

test("searches for photos with a debounce, clears search field on Escape", async () => {
  const view = render(<FlickrSearch />);

  const searchInput = screen.getByTestId("search-input");
  expect(searchInput).toBeInTheDocument();
  expect(searchInput.textContent).toEqual("");

  const displayedResponse = screen.getByTestId("displayed-response");
  expect(displayedResponse).toBeInTheDocument();

  const searchTerm = "house";

  userEvent.type(searchInput, searchTerm);

  expect(searchInput).toHaveValue(searchTerm);

  expect(displayedResponse).toHaveTextContent(
    "Please type in a search term above"
  );

  await waitFor(() => {
    expect(displayedResponse).toHaveTextContent("Loading..");
  });

  await waitFor(() => {
    expect(displayedResponse).toHaveTextContent(
      "Found 42 photos - here's one:"
    );
  });

  const photo = mockFlickrPhotos.photos.photo[0] as FlickrPhoto;

  const img: HTMLImageElement = screen.getByTestId("photo");
  expect(img).toBeInTheDocument();
  expect(img.src).toEqual(buildFlickrPhotoURL(photo));

  const title = screen.getByTestId("photo-title");
  expect(title).toBeInTheDocument();
  expect(title).toHaveTextContent(photo.title);

  const refreshButton = screen.getByTestId("refresh-button");
  expect(refreshButton).toBeInTheDocument();

  userEvent.click(refreshButton);

  await waitFor(() => {
    expect(displayedResponse).toHaveTextContent("Loading..");
  });

  await waitFor(() => {
    expect(displayedResponse).not.toHaveTextContent("Loading..");
  });

  userEvent.keyboard("{Escape}");

  expect(searchInput.textContent).toEqual("");

  expect(displayedResponse).toHaveTextContent(
    "Please type in a search term above"
  );

  const sidebarButton = screen.getByTestId("sidebar-button");
  expect(sidebarButton).toBeInTheDocument();

  userEvent.click(sidebarButton);

  expect(view).toMatchSnapshot();
});
