import { render, screen } from "@testing-library/react";
import { create } from "react-test-renderer";
import { App } from "../App";

test("renders learn react link", () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/iu);
  expect(linkElement).toBeInTheDocument();
});

test("should match the snapshot", () => {
  const tree = create(<App />).toJSON();

  expect(tree).toMatchSnapshot();
});
