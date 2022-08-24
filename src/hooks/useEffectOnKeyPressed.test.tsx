import {
  act,
  fireEvent,
  render,
  renderHook,
  waitFor,
} from "@testing-library/react";
import { useEffectOnKeyPressed } from "./useEffectOnKeyPressed";

it("should call the effect callback when the 'Escape' key is pressed", async () => {
  const effect = jest.fn();

  renderHook(() => useEffectOnKeyPressed({ effect, key: "Escape" }));

  fireEvent.keyDown(document, { key: "Enter" });

  await waitFor(() => {
    expect(effect).not.toHaveBeenCalled();
  });

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).toHaveBeenCalledWith("Escape");
  });
});

it("should call the effect callback when the 'Enter' key is pressed", async () => {
  const effect = jest.fn();

  renderHook(() => useEffectOnKeyPressed({ effect, key: "Enter" }));

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).not.toHaveBeenCalled();
  });

  fireEvent.keyDown(document, { key: "Enter" });

  await waitFor(() => {
    expect(effect).toHaveBeenCalledWith("Enter");
  });
});

it("should call the effect callback when either 'OS' (Firefox) or 'Meta' (Chromium) is pressed", async () => {
  const effect = jest.fn();

  renderHook(() => useEffectOnKeyPressed({ effect, keys: ["OS", "Meta"] }));

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).not.toHaveBeenCalled();
  });

  fireEvent.keyDown(document, { key: "OS" });

  await waitFor(() => {
    expect(effect).toHaveBeenLastCalledWith("OS");
  });

  fireEvent.keyDown(document, { key: "Meta" });

  await waitFor(() => {
    expect(effect).toHaveBeenLastCalledWith("Meta");
  });
});

it("should NOT call the effect callback if shouldCallEffect returns `false`", async () => {
  const effect = jest.fn();

  renderHook(() =>
    useEffectOnKeyPressed({
      effect,
      key: "Escape",
      shouldCallEffect: () => false,
    })
  );

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).not.toHaveBeenCalled();
  });
});

it("should no longer call the effect callback after the component is unmounted", async () => {
  const effect = jest.fn();

  const TestComponentUsingHook = () => {
    useEffectOnKeyPressed({
      effect,
      key: "Escape",
    });

    return <></>;
  };

  const { unmount } = render(<TestComponentUsingHook />);

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).toHaveBeenCalledWith("Escape");
  });

  act(() => {
    unmount();
  });

  fireEvent.keyDown(document, { key: "Escape" });

  await waitFor(() => {
    expect(effect).toHaveBeenCalledTimes(1);
  });
});
