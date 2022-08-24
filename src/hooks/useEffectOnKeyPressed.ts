import { useEffect } from "react";

type Props = {
  effect: (key: KeyboardEvent["key"]) => void;
  shouldCallEffect?: () => boolean;
} & (
  | {
      key: KeyboardEvent["key"];
      keys?: undefined;
    }
  | {
      key?: undefined;
      keys: Array<KeyboardEvent["key"]>;
    }
);

// https://developer.mozilla.org/en-US/docs/Web/API/UI_Events/Keyboard_event_code_values

export const useEffectOnKeyPressed = ({
  effect,
  key,
  keys = [], // could be e.g. ["OS", "Meta"] to accomodate Firefox and Chrome
  shouldCallEffect = () => true,
}: Props) => {
  useEffect(() => {
    const listener = (event: KeyboardEvent) => {
      // Why the "undefined" below? : because Chromium autocomplete triggers an
      // Event of { type: "keydown" } with no "key" field when it fills in
      // form fields with previously saved data. It isn't an actual
      // KeyboardEvent per se, but is treated like one, in that it triggers
      // "keydown" event listeners. TypeScript's KeyboardEvent type says
      // that "key" is always present, which isn't true if any field has
      // autocomplete on (e.g. a password field) in Chromium-based browsers
      // (Chrome, Edge, etc.)
      const eventKey = event.key as string | undefined;

      if (
        eventKey &&
        shouldCallEffect() &&
        (eventKey === key || keys.includes(eventKey))
      ) {
        effect(eventKey);
      }
    };

    document.addEventListener("keydown", listener);

    return () => {
      document.removeEventListener("keydown", listener);
    };
  }, [effect, key, keys, shouldCallEffect]);
};
