import { useEffect } from "react";

export const useEffectOnMountOrUnmount = ({
  onMount = () => undefined,
  onUnmount = () => undefined,
}: {
  onMount?: () => void;
  onUnmount?: () => void;
}) => {
  useEffect(
    () => {
      onMount();

      return onUnmount;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );
};
