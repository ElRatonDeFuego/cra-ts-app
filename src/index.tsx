import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./components/App";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

const root = createRoot(document.getElementById("root") as HTMLElement);

root.render(
  <React.StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </React.StrictMode>
);
