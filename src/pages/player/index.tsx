/**
 * Empty state component for main player page.
 *
 * React Router route: "/" index route (configured in routes.ts)
 *
 * Responsibilities:
 * - Displays message when no track is selected
 * - Prompts user to select a track from sidebar
 *
 * Data ownership: None
 * No network calls - static content.
 */
import { Box, Text } from "@mantine/core";

export default function PlayerIndex() {
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "2rem",
      }}
    >
      <Box style={{ textAlign: "center" }}>
        <Text size="xl" c="dimmed">
          Select a track from the sidebar to begin
        </Text>
      </Box>
    </Box>
  );
}
