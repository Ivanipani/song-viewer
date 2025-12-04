import { describe, test, expect } from "bun:test";
import { render, screen } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { theme } from "../theme";

describe("Example Test Suite", () => {
  test("basic assertion test", () => {
    expect(1 + 1).toBe(2);
  });

  test("example React component test with Mantine", () => {
    const TestComponent = () => (
      <div data-testid="test-component">Hello Test</div>
    );

    render(
      <MantineProvider theme={theme}>
        <TestComponent />
      </MantineProvider>
    );

    const element = screen.getByTestId("test-component");
    expect(element).toBeTruthy();
    expect(element.textContent).toBe("Hello Test");
  });

  test("formatTime utility function equivalent", () => {
    const formatTime = (seconds: number) => {
      const roundedSeconds = Math.round(seconds);
      const minutes = Math.floor(roundedSeconds / 60);
      const remainingSeconds = Math.round(roundedSeconds % 60);
      return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
    };

    expect(formatTime(0)).toBe("0:00");
    expect(formatTime(30)).toBe("0:30");
    expect(formatTime(90)).toBe("1:30");
    expect(formatTime(125)).toBe("2:05");
  });
});
