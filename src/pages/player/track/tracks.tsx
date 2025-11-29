/**
 * Track stems/layers view component for track details.
 *
 * React Router route: "/track/:trackId/tracks" (configured in routes.ts)
 *
 * Parent component: TrackLayout (track/layout.tsx)
 *
 * Responsibilities:
 * - Displays individual track stems or audio layers
 * - Currently shows placeholder text
 * - Future: Multi-track waveform view, stem isolation controls
 *
 * Data sources:
 * - Could receive track data from parent via Outlet context (future)
 * - Could load stem audio files from metadata (future)
 *
 * No data ownership - placeholder component.
 * No network calls - static content.
 */
import { Box, Text } from "@mantine/core";

export default function TracksView() {
  return (
    <Box p="lg">
      <Text size="lg" c="dimmed">
        Track stems content goes here
      </Text>
      <Text size="sm" c="dimmed" mt="md">
        This is a placeholder for track stems/layers. Future enhancements could include:
      </Text>
      <Text size="sm" c="dimmed" component="ul" ml="md" mt="xs">
        <li>Individual audio stems (vocals, drums, bass, guitar, etc.)</li>
        <li>Waveform visualization for each track</li>
        <li>Solo/mute controls for each stem</li>
        <li>Volume and pan controls per stem</li>
      </Text>
    </Box>
  );
}
