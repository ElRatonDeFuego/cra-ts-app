import Joi from "joi";

export interface FlickrPhoto {
  farm: number;
  id: string;
  secret: string;
  server: string;
  title: string;
}

export const buildFlickrPhotoURL = (photo: FlickrPhoto) =>
  `http://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`;

interface FlickrPhotos {
  code?: number;
  message?: string;
  photos: {
    photo: Array<FlickrPhoto>;
    total: number;
  };
  stat: "fail" | "ok";
}

const FlickrSchema = Joi.object<FlickrPhotos>({
  code: Joi.number().strict(true).integer().positive().optional(),
  message: Joi.string().strict(true).optional(),
  photos: Joi.object({
    photo: Joi.array()
      .strict(true)
      .items(
        Joi.object({
          farm: Joi.number()
            .strict(true)
            .integer()
            .positive()
            .allow(0)
            .required(),
          id: Joi.string().strict(true).required(),
          secret: Joi.string().strict(true).required(),
          server: Joi.string().strict(true).required(),
          title: Joi.string().strict(true).allow("").required(),
        })
          .strict(true)
          .unknown(true)
      )
      .required(),
    total: Joi.number().strict(true).integer().positive().allow(0).required(),
  })
    .strict(true)
    .unknown(true)
    .optional(),
  stat: Joi.string().strict(true).valid("fail", "ok").required(),
}).strict(true);

export const FlickrBaseURL = "https://api.flickr.com/services/rest";

export const FlickrSearchURL = `${FlickrBaseURL}/?format=json&method=flickr.photos.search&api_key=2fd41b49fedfd589dc265350521ab539&tags=`;

export const GenericErrorMessage = "Failed to retrieve photos";

export const mockFlickrPhotos: FlickrPhotos = {
  photos: {
    photo: [
      {
        farm: 66,
        id: "51263792541",
        secret: "a51806c4e6",
        server: "65535",
        title: "Photo data returned by msw",
      },
    ],
    total: 42,
  },
  stat: "ok",
};

export const mockFlickrResult = `jsonFlickrApi(${JSON.stringify(
  mockFlickrPhotos
)})`;

export const parseFlickrResponse = (data: unknown): FlickrPhotos => {
  if (
    !(
      typeof data === "string" &&
      data.startsWith("jsonFlickrApi(") &&
      data.endsWith(")")
    )
  ) {
    throw new Error(GenericErrorMessage);
  }

  const stringifiedJSON = data
    ?.replace(/^jsonFlickrApi\(/u, "")
    .replace(/\)$/u, "");

  const jsonValue = JSON.parse(stringifiedJSON || "{}") as FlickrPhotos;

  const { error, value } = FlickrSchema.validate(jsonValue);

  if (error) {
    throw error;
  }

  return value;
};
