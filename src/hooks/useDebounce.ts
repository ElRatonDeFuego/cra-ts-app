import { useEffect, useState } from "react";

export const useDebounce = <T>(value: T, delayInMs = 150) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timeoutHandler = window.setTimeout(() => {
      setDebouncedValue(value);
    }, delayInMs);

    return () => {
      clearTimeout(timeoutHandler);
    };
  }, [value, delayInMs]);

  return debouncedValue;
};
