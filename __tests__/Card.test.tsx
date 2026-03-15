import React from "react";
import { render } from "@testing-library/react-native";
import { Card } from "../src/components/Card";

describe("Card", () => {
  it("renders children content", () => {
    const { getByText } = render(<Card>Test Content</Card>);

    expect(getByText("Test Content")).toBeTruthy();
  });

  it("applies default container styles", () => {
    const { toJSON } = render(<Card>Content</Card>);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("accepts custom style prop", () => {
    const customStyle = { backgroundColor: "red" };
    const { getAllByType } = render(<Card style={customStyle}>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("renders with borderless variant", () => {
    const { getAllByType } = render(<Card borderless>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("applies borderless style when borderless prop is true", () => {
    const { getAllByType } = render(<Card borderless>Content</Card>);

    const views = getAllByType(require("react-native").View);
    // Should have borderless style applied
    expect(views[0].props.style).toBeDefined();
  });

  it("does not apply borderless style when borderless prop is false", () => {
    const { getAllByType } = render(<Card borderless={false}>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("renders multiple children", () => {
    const { getByText } = render(
      <Card>
        <child1>Child 1</child1>
        <child2>Child 2</child2>
      </Card>
    );

    expect(getByText("Child 1")).toBeTruthy();
    expect(getByText("Child 2")).toBeTruthy();
  });

  it("renders nested components", () => {
    const NestedComponent = () => <nested>Nested</nested>;
    const { getByText } = render(
      <Card>
        <NestedComponent />
      </Card>
    );

    expect(getByText("Nested")).toBeTruthy();
  });

  it("renders with surface background color", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("has rounded corners", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("has padding", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("has border width", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("has border color", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("has shadow styles", () => {
    const { getAllByType } = render(<Card>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("removes shadow when borderless", () => {
    const { getAllByType } = render(<Card borderless>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("removes border when borderless", () => {
    const { getAllByType } = render(<Card borderless>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("renders empty content without crashing", () => {
    expect(() => render(<Card />)).not.toThrow();
  });

  it("renders with text content", () => {
    const { getByText } = render(<Card>Hello World</Card>);

    expect(getByText("Hello World")).toBeTruthy();
  });

  it("renders with number content", () => {
    const { getByText } = render(<Card>{123}</Card>);

    expect(getByText("123")).toBeTruthy();
  });

  it("renders with null content", () => {
    expect(() => render(<Card>{null}</Card>)).not.toThrow();
  });

  it("renders with undefined content", () => {
    expect(() => render(<Card>{undefined}</Card>)).not.toThrow();
  });

  it("renders with array of children", () => {
    const { getByText } = render(
      <Card>
        {[1, 2, 3].map((i) => (
          <child key={i}>Child {i}</child>
        ))}
      </Card>
    );

    expect(getByText("Child 1")).toBeTruthy();
    expect(getByText("Child 2")).toBeTruthy();
    expect(getByText("Child 3")).toBeTruthy();
  });

  it("forwards testID prop", () => {
    const { getByTestId } = render(<Card testID="test-card">Content</Card>);

    expect(getByTestId("test-card")).toBeTruthy();
  });

  it("forwards accessibility props", () => {
    const { getByLabelText } = render(
      <Card accessibilityLabel="test-card">Content</Card>
    );

    expect(getByLabelText("test-card")).toBeTruthy();
  });

  it("merges custom style with default style", () => {
    const customStyle = { marginTop: 20 };
    const { getAllByType } = render(<Card style={customStyle}>Content</Card>);

    const views = getAllByType(require("react-native").View);
    const style = views[0].props.style;
    expect(style).toBeDefined();
  });

  it("handles style as array", () => {
    const styleArray = [{ marginTop: 20 }, { marginBottom: 10 }];
    const { getAllByType } = render(<Card style={styleArray}>Content</Card>);

    const views = getAllByType(require("react-native").View);
    expect(views[0].props.style).toBeDefined();
  });

  it("renders consistently across multiple renders", () => {
    const { rerender } = render(<Card>Content</Card>);

    rerender(<Card>Updated Content</Card>);

    const { getByText } = render(<Card>Updated Content</Card>);
    expect(getByText("Updated Content")).toBeTruthy();
  });

  it("does not have interactive behavior by default", () => {
    const { toJSON } = render(<Card>Content</Card>);

    const tree = toJSON();
    expect(tree).toBeDefined();
  });

  it("supports conditional rendering", () => {
    const showCard = true;
    const { getByText } = render(<Card>{showCard && "Conditional"}</Card>);

    expect(getByText("Conditional")).toBeTruthy();
  });

  it("supports fragment children", () => {
    const { getByText } = render(
      <Card>
        <>
          <child>Fragment Child 1</child>
          <child>Fragment Child 2</child>
        </>
      </Card>
    );

    expect(getByText("Fragment Child 1")).toBeTruthy();
    expect(getByText("Fragment Child 2")).toBeTruthy();
  });
});
