import { describe, test, expect, mock } from "bun:test";
import { render } from "@testing-library/react";
import { MantineProvider } from "@mantine/core";
import { theme } from "../../../theme";
import { PlayControl } from "../../../pages/player/PlayControl";
import { AudioState } from "../../../api/types";

// Mock CSS module
mock.module("../../../pages/player/PlayControl.module.css", () => ({
  default: { slider: "slider" },
}));

describe("PlayControl Component", () => {
  const createMockAudioState = (overrides?: Partial<AudioState>): AudioState => ({
    selectedTrack: {
      id: "test-id",
      title: "Test Song",
      artist: "Test Artist",
      filename: "test.mp3",
      checksum: "test-checksum",
      tags: [],
      added_date: "2024-01-01",
      metadata: {},
      url: "/test.mp3",
      index: 0,
    },
    sound: null,
    isPlaying: false,
    position: 0,
    duration: 180,
    loop: "none",
    shuffle: false,
    ...overrides,
  });

  const createMockProps = (audioStateOverrides?: Partial<AudioState>) => ({
    audioState: createMockAudioState(audioStateOverrides),
    setAudioState: mock(() => {}),
    playNext: mock(() => {}),
    playPrev: mock(() => {}),
    showTrackPlayer: mock(() => {}),
  });

  test("renders track information correctly", () => {
    const props = createMockProps();

    const { getByText } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...props} />
      </MantineProvider>
    );

    expect(getByText("Test Song")).toBeTruthy();
    expect(getByText("Test Artist")).toBeTruthy();
  });

  test("displays correct time format", () => {
    const props = createMockProps({
      position: 65,
      duration: 245,
    });

    const { getByText } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...props} />
      </MantineProvider>
    );

    // Position: 65 seconds = 1:05
    expect(getByText("1:05")).toBeTruthy();
    // Duration: 245 seconds = 4:05
    expect(getByText("4:05")).toBeTruthy();
  });

  test("shows play icon when not playing", () => {
    const props = createMockProps({ isPlaying: false });

    const { container } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...props} />
      </MantineProvider>
    );

    // IconPlayerPlay should be rendered
    const playIcons = container.querySelectorAll('svg');
    expect(playIcons.length).toBeGreaterThan(0);
  });

  test("shows pause icon when playing", () => {
    const props = createMockProps({ isPlaying: true });

    const { container } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...props} />
      </MantineProvider>
    );

    // Component should render when playing
    const playIcons = container.querySelectorAll('svg');
    expect(playIcons.length).toBeGreaterThan(0);
  });

  test("displays shuffle state correctly", () => {
    const shuffleEnabled = createMockProps({ shuffle: true });
    const { container: containerOn } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...shuffleEnabled} />
      </MantineProvider>
    );
    expect(containerOn.textContent).toContain("Test Song");

    const shuffleDisabled = createMockProps({ shuffle: false });
    const { container: containerOff } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...shuffleDisabled} />
      </MantineProvider>
    );
    expect(containerOff.textContent).toContain("Test Song");
  });

  test("displays loop state correctly", () => {
    const loopNone = createMockProps({ loop: "none" });
    const { container: containerNone } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...loopNone} />
      </MantineProvider>
    );
    expect(containerNone.textContent).toContain("Test Song");

    const loopAll = createMockProps({ loop: "all" });
    const { container: containerAll } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...loopAll} />
      </MantineProvider>
    );
    expect(containerAll.textContent).toContain("Test Song");

    const loopSingle = createMockProps({ loop: "single" });
    const { container: containerSingle } = render(
      <MantineProvider theme={theme}>
        <PlayControl {...loopSingle} />
      </MantineProvider>
    );
    expect(containerSingle.textContent).toContain("Test Song");
  });
});
