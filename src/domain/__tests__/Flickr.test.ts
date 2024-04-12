import {
  buildFlickrPhotoURL,
  GenericErrorMessage,
  mockFlickrPhotos,
  parseFlickrResponse,
} from "../Flickr";

import type { FlickrPhoto } from "../Flickr";

it("should build the flickr photo URL from photo data", () => {
  const photo = mockFlickrPhotos.photos.photo[0] as FlickrPhoto;

  expect(buildFlickrPhotoURL(photo)).toEqual(
    `http://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`
  );
});

it("should parse the response from the Flickr API", () => {
  expect(() => parseFlickrResponse(42)).toThrow(GenericErrorMessage);
  expect(() => parseFlickrResponse([])).toThrow(GenericErrorMessage);
  expect(() => parseFlickrResponse({})).toThrow(GenericErrorMessage);
  expect(() => parseFlickrResponse("")).toThrow(GenericErrorMessage);

  expect(() =>
    parseFlickrResponse(`jsonFlickrApi(${JSON.stringify({ photos: [] })})`)
  ).toThrow('"photos" must be of type object');

  expect(() =>
    parseFlickrResponse(`jsonFlickrApi(${JSON.stringify({ photos: {} })})`)
  ).toThrow('"photos.photo" is required');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({ photos: { photo: "foo" } })})`
    )
  ).toThrow('"photos.photo" must be an array');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({ photos: { photo: [] } })})`
    )
  ).toThrow('"photos.total" is required');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [], total: "foo" },
      })})`
    )
  ).toThrow('"photos.total" must be a number');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [], total: -42.34 },
      })})`
    )
  ).toThrow('"photos.total" must be an integer');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [], total: -42 },
      })})`
    )
  ).toThrow('"photos.total" must be a positive number');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [], total: 0 },
      })})`
    )
  ).toThrow('"stat" is required');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [], total: 0 },
        stat: "idunno",
      })})`
    )
  ).toThrow('"stat" must be one of [fail, ok]');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [42], total: 1 },
        stat: "ok",
      })})`
    )
  ).toThrow('"photos.photo[0]" must be of type object');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: { photo: [{}], total: 1 },
        stat: "ok",
      })})`
    )
  ).toThrow('"photos.photo[0].farm" is required');

  expect(() =>
    parseFlickrResponse(
      `jsonFlickrApi(${JSON.stringify({
        photos: {
          photo: [
            {
              farm: 42,
              id: "bar",
              secret: "baz",
              server: "glub",
              title: "meh",
            },
          ],
          total: 1,
        },
        stat: "ok",
      })})`
    )
  ).not.toThrow();
});
