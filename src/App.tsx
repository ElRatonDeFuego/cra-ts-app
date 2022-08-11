import logo from "./logo.svg";
import styles from "./App.module.css";

export const App = () => (
  <div className={styles["app"]}>
    <header className={styles["app-header"]}>
      <img src={logo} className={styles["app-logo"]} alt="logo" />
      <p>
        Edit <code>src/App.tsx</code> and save to reload.
      </p>
      <a
        className={styles["app-link"]}
        href="https://reactjs.org"
        target="_blank"
        rel="noopener noreferrer"
      >
        Learn React
      </a>
    </header>
  </div>
);
