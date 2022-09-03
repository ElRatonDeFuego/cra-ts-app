import { faBarsStaggered } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import styles from "./App.module.css";
import logo from "./logo.svg";

export const App = () => (
  <div className="text-center">
    <header
      className={`min-h-screen flex flex-col items-center justify-center text-white ${
        styles["app-header"] ?? /* istanbul ignore next */ ""
      }`}
    >
      <img
        src={logo}
        className={"h-96 pointer-events-none animate-spin-slow"}
        alt="logo"
      />
      <p>
        <FontAwesomeIcon className="mr-6" icon={faBarsStaggered} />
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className={styles["app-link"] ?? /* istanbul ignore next */ ""}
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
);
