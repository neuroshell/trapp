import React from "react";
import { render, fireEvent } from "@testing-library/react-native";
import { HomeScreen } from "../src/screens/HomeScreen";

describe("HomeScreen", () => {
  it("renders title and buttons", () => {
    const navigation = { navigate: jest.fn() } as any;
    const { getByText } = render(<HomeScreen navigation={navigation} />);

    expect(getByText("FitTrack Pro")).toBeTruthy();
    expect(getByText("Quick Actions")).toBeTruthy();

    fireEvent.press(getByText("Run"));
    expect(navigation.navigate).toHaveBeenCalledWith("Log");

    fireEvent.press(getByText("Push-up"));
    expect(navigation.navigate).toHaveBeenCalledWith("Log");

    fireEvent.press(getByText("Squats"));
    expect(navigation.navigate).toHaveBeenCalledWith("Log");

    fireEvent.press(getByText("Pull-up"));
    expect(navigation.navigate).toHaveBeenCalledWith("Log");
  });
});
