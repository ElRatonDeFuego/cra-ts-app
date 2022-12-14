import { useLayoutEffect } from "react";
import { create } from "react-test-renderer";
import { ErrorBoundary } from "../ErrorBoundary";

const ComponentThatWillThrow = () => {
  useLayoutEffect(() => {
    throw new Error("will be caught by the error boundary");
  });

  return <>this will never render</>;
};

test("should match the snapshot without a fallback", () => {
  const tree = create(
    <ErrorBoundary>
      <ComponentThatWillThrow />
    </ErrorBoundary>
  ).toJSON();

  expect(tree).toMatchSnapshot();
});

test("should match the snapshot with a fallback", () => {
  const tree = create(
    <ErrorBoundary fallback={<>the fallback component</>}>
      <ComponentThatWillThrow />
    </ErrorBoundary>
  ).toJSON();

  expect(tree).toMatchSnapshot();
});
