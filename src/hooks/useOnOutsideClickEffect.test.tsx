import { fireEvent, render, screen } from "@testing-library/react";
import { useOnOutsideClickEffect } from "./useOnOutsideClickEffect";

const mockEffect = jest.fn();
let mockOutsideOfElement: Element | null;
let mockRefCallback: (node: Element | null) => void;

const TestComponentUsingHook = () => {
  useOnOutsideClickEffect({
    effect: mockEffect,
    outsideOf: mockOutsideOfElement,
  });

  return (
    <div>
      <div data-testid="outside-element" />
      <div data-testid="container-element" ref={mockRefCallback}>
        <div data-testid="inside-element" />
      </div>
    </div>
  );
};

beforeEach(() => {
  mockRefCallback = (node) => {
    mockOutsideOfElement = node;
  };
});

afterEach(() => {
  jest.clearAllMocks();
});

it("should set the ref when rendered", () => {
  render(<TestComponentUsingHook />);

  expect(mockOutsideOfElement).toBe(screen.getByTestId("container-element"));
});

it("should call the effect when clicking outside of the `outsideOf` element", () => {
  const { rerender } = render(<TestComponentUsingHook />);

  rerender(<TestComponentUsingHook />); // to make sure `mockOutsideOfElement` is passed to the `useOnOutsideClickEffect` hook

  fireEvent.click(screen.getByTestId("outside-element"));

  expect(mockEffect).toHaveBeenCalled();
});

it("should not call the effect when clicking inside of the `outsideOf` element", () => {
  const { rerender } = render(<TestComponentUsingHook />);

  rerender(<TestComponentUsingHook />); // to make sure `mockOutsideOfElement` is passed to the `useOnOutsideClickEffect` hook

  fireEvent.click(screen.getByTestId("container-element"));

  expect(mockEffect).not.toHaveBeenCalled();

  fireEvent.click(screen.getByTestId("inside-element"));

  expect(mockEffect).not.toHaveBeenCalled();
});
