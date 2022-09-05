import { CanceledError } from "axios";
import { useDebounce } from "hooks/useDebounce";
import { useEffectOnKeyPressed } from "hooks/useEffectOnKeyPressed";
import { useEffect, useMemo, useState } from "react";

// import/no-unused-modules requires non-baseUrl paths
import {
  buildFlickrPhotoURL,
  FlickrSearchURL,
  GenericErrorMessage,
  parseFlickrResponse,
} from "../../domain/Flickr";

import { useRequest } from "../../hooks/useRequest";

import type { FlickrPhoto } from "../../domain/Flickr";

export const useFlickrSearch = () => {
  const [photo, setPhoto] = useState<{ title?: string; URL?: string }>({});
  const [search, setSearch] = useState("");

  const debouncedSearch = useDebounce(search, 500);

  useEffectOnKeyPressed({ effect: () => setSearch(""), key: "Escape" });

  const url = `${FlickrSearchURL}${encodeURIComponent(debouncedSearch)}`;

  const { cancelRequest, data, error, loading, runRequest } =
    useRequest<string>({
      timeout: 5000,
      url,
    });

  useEffect(() => {
    if (debouncedSearch.length && search.length) {
      runRequest().catch(
        /* istanbul ignore next */ () => {
          // prevent unhandled exceptions
        }
      );
    }
  }, [debouncedSearch, runRequest, search]);

  const displayedResponse = useMemo(() => {
    if (error && !(error instanceof CanceledError)) {
      return error.message;
    }

    if (loading) {
      return "Loading..";
    }

    if (!(debouncedSearch.length && search.length && data)) {
      return "Please type in a search term above";
    }

    let result;

    try {
      result = parseFlickrResponse(data);
    } catch (parseError) {
      return GenericErrorMessage;
    }

    if (result.stat === "fail") {
      return GenericErrorMessage;
    }

    const { total } = result.photos;

    let responseMessage = `Found ${total} photo${total === 1 ? "" : "s"}`;

    if (result.photos.total > 0) {
      const randomPhoto = result.photos.photo[
        Math.floor(Math.random() * result.photos.photo.length)
      ] as FlickrPhoto;

      if (total !== 1) {
        responseMessage += " - here's one:";
      }

      setPhoto({
        title: randomPhoto.title,
        URL: buildFlickrPhotoURL(randomPhoto),
      });
    }

    return responseMessage;
  }, [data, debouncedSearch, error, loading, search]);

  return {
    cancelRequest, // used for tests
    displayedResponse,
    loading,
    photo,
    runRequest,
    search,
    setSearch,
  };
};
