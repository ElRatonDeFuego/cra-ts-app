import { useEffect } from "react";

export const useOnOutsideClickEffect = ({
  effect,
  outsideOf,
}: {
  outsideOf: Element | null;
  effect: () => void;
}) => {
  useEffect(() => {
    if (!outsideOf) {
      return undefined;
    }

    const effectCallback = (event: MouseEvent) => {
      if (!outsideOf.contains(event.target as Node | null)) {
        effect();
      }
    };

    document.addEventListener("click", effectCallback);

    return () => {
      document.removeEventListener("click", effectCallback);
    };
  }, [effect, outsideOf]);
};
