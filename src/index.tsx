import React from "react";
import { createRoot } from "react-dom/client";
import { ErrorBoundary } from "./components/ErrorBoundary";
import { FlickrSearch } from "./components/FlickrSearch";
import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <FlickrSearch />
    </ErrorBoundary>
  </React.StrictMode>
);
