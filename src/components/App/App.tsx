import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./App.module.css";
import logo from "./logo.svg";

export const App = () => (
  <div className="text-center">
    <header className="bg-gray-900 min-h-screen flex flex-col items-center justify-center text-white text-3xl">
      <img
        src={logo}
        className={`h-96 pointer-events-none ${
          styles["app-logo"] ?? /* istanbul ignore next */ ""
        }`}
        alt="logo"
      />
      <p>
        <FontAwesomeIcon className="mr-6" icon={faBarsStaggered} />
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className="text-blue-400"
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
);
