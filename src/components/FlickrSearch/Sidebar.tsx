import {
  faBars,
  faCakeCandles,
  faClose,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <span className="text-emerald-50 opacity-95">
      <div
        className={`fixed top-0 right-0 p-6 pt-20 min-h-screen ease-in-out
                    duration-300 bg-slate-800 flex flex-col items-center
                    ${isOpen ? "translate-x-0" : "translate-x-full"}`}
      >
        <h2>Useless animated sidebar!</h2>
        <FontAwesomeIcon
          className="text-center mt-8 text-2xl"
          icon={faCakeCandles}
        />
      </div>
      <FontAwesomeIcon
        data-testid="sidebar-button"
        onClick={() => setIsOpen((isOpen) => !isOpen)}
        className="fixed top-4 right-4 text-3xl"
        icon={isOpen ? faClose : faBars}
      />
    </span>
  );
};
