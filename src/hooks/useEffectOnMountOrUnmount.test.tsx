import { act, render } from "@testing-library/react";
import { useEffectOnMountOrUnmount } from "./useEffectOnMountOrUnmount";

jest.mock("react", () => {
  /* eslint-disable */
  const originalModule = jest.requireActual("react");

  return {
    __esModule: true,
    ...originalModule,
    useEffect: (cb: () => unknown, deps: unknown) => {
      useEffectDeps = deps;

      return originalModule.useEffect(cb, deps);
    },
  };
  /* eslint-enable */
});

let useEffectDeps: unknown;

afterEach(() => {
  jest.clearAllMocks();
});

it("should run mount and unmount effects", () => {
  const onMount = jest.fn();
  const onUnmount = jest.fn();

  const TestComponentUsingHook = () => {
    useEffectOnMountOrUnmount({ onMount, onUnmount });

    return <></>;
  };

  const { unmount } = render(<TestComponentUsingHook />);

  expect(useEffectDeps).toEqual([]);

  expect(onMount).toHaveBeenCalled();
  expect(onUnmount).not.toHaveBeenCalled();

  act(() => {
    unmount();
  });

  expect(onUnmount).toHaveBeenCalled();
});

it("should use the default value for onMount", () => {
  const onUnmount = jest.fn();

  const TestComponentUsingHook = () => {
    useEffectOnMountOrUnmount({ onUnmount });

    return <></>;
  };

  const { unmount } = render(<TestComponentUsingHook />);

  expect(onUnmount).not.toHaveBeenCalled();

  act(() => {
    unmount();
  });

  expect(onUnmount).toHaveBeenCalled();
});

it("should use the default value for onUnmount", () => {
  const onMount = jest.fn();

  const TestComponentUsingHook = () => {
    useEffectOnMountOrUnmount({ onMount });

    return <></>;
  };

  const { unmount } = render(<TestComponentUsingHook />);

  expect(onMount).toHaveBeenCalled();

  act(() => {
    unmount();
  });
});
