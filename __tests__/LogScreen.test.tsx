import React from "react";
import { render, fireEvent, waitFor } from "@testing-library/react-native";
import { LogScreen } from "../src/screens/LogScreen";
import AsyncStorage from "@react-native-async-storage/async-storage";

describe("LogScreen", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (AsyncStorage.getItem as jest.Mock).mockResolvedValue(JSON.stringify({ entries: [] }));
  });

  it("renders form and saves entry", async () => {
    const { getByText, getByPlaceholderText, findByText } = render(<LogScreen />);

    // should show save button
    const saveButton = getByText("Save entry");
    expect(saveButton).toBeTruthy();

    // fill quantity and save
    const quantityInput = getByPlaceholderText("Number of reps / minutes");
    fireEvent.changeText(quantityInput, "10");

    fireEvent.press(saveButton);

    await waitFor(() => {
      expect(findByText("10")).resolves.toBeTruthy();
    });

    // should write state to async storage
    expect(AsyncStorage.setItem).toHaveBeenCalled();
  });
});
