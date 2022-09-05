import { faSearch, faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./FlickrSearch.module.scss";
import { Sidebar } from "./Sidebar";
import { useFlickrSearch } from "./useFlickrSearch";

export const FlickrSearch = () => {
  const { displayedResponse, loading, photo, runRequest, search, setSearch } =
    useFlickrSearch();

  return (
    <>
      <Sidebar />
      <span
        className={`items-center bg-gray-600 text-white flex flex-col
            justify-center min-h-screen max-w-full ${
              styles["flickr-search"] ?? /* istanbul ignore next */ ""
            }`}
      >
        <p className="font-light leading-none">Look for Flickr photos</p>
        <div className="bg-white text-gray-900 p-2 m-5 rounded-lg">
          <label htmlFor="search">
            <FontAwesomeIcon
              className={`ml-5 mr-5 text-xl ${loading ? "animate-spin" : ""}`}
              icon={loading ? faSpinner : faSearch}
            />
          </label>
          <input
            className="outline-none"
            data-testid="search-input"
            id="search"
            name="search"
            onChange={(event) => setSearch(event.target.value)}
            type="text"
            value={search}
          />
        </div>
        <p data-testid="displayed-response">{displayedResponse}</p>
        {photo.URL && (
          <>
            <img
              alt="first one found matching the search term"
              className="m-4 rounded-lg shadow-xl"
              data-testid="photo"
              src={photo.URL}
            />
            <p className="text-sm mt-4 px-1" data-testid="photo-title">
              {photo.title}
            </p>
            <button
              className="text-gray-900 px-5 py-3 m-5 cursor-pointer bg-white
              hover:bg-slate-100 focus:outline-none hover:shadow-lg
              hover:text-blue-800 active:bg-slate-300 active:animate-ping
              rounded-lg p-3 mt-6 shadow-lg uppercase tracking-wider
              font-medium"
              data-testid="refresh-button"
              onClick={() => {
                runRequest().catch(
                  /* istanbul ignore next */ () => {
                    // prevent unhandled exceptions
                  }
                );
              }}
            >
              Another one, please!
            </button>
          </>
        )}
      </span>
    </>
  );
};
