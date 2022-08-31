import { renderHook, waitFor } from "@testing-library/react";
import { useDebounce } from "../useDebounce";

it("should debounce the provided value", async () => {
  const initialText = "initial search";
  const newText = "new text to search for";

  const { result, rerender } = renderHook(useDebounce, {
    initialProps: initialText,
  });

  expect(result.current).toEqual(initialText);

  rerender(initialText);

  expect(result.current).toEqual(initialText);

  rerender(newText);

  expect(result.current).toEqual(initialText);

  await waitFor(() => expect(result.current).toEqual(newText));
});
