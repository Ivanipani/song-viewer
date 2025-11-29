/**
 * Chords view component for track details.
 *
 * React Router route: "/track/:trackId/chords" (configured in routes.ts)
 *
 * Parent component: TrackLayout (track/layout.tsx)
 *
 * Responsibilities:
 * - Displays chord progressions and diagrams for the selected track
 * - Currently shows placeholder text
 * - Future: Interactive chord diagrams, chord progression editor
 *
 * Data sources:
 * - Could receive track data from parent via Outlet context (future)
 * - Could load chord data from track metadata (future)
 *
 * No data ownership - placeholder component.
 * No network calls - static content.
 */
import { Box, Text } from "@mantine/core";

export default function ChordsView() {
  return (
    <Box p="lg">
      <Text size="lg" c="dimmed">
        Chords content goes here
      </Text>
      <Text size="sm" c="dimmed" mt="md">
        This is a placeholder for track chords. Future enhancements could include:
      </Text>
      <Text size="sm" c="dimmed" component="ul" ml="md" mt="xs">
        <li>Interactive chord diagrams (guitar, piano, ukulele)</li>
        <li>Chord progression timeline synced with audio</li>
        <li>Transpose chords to different keys</li>
        <li>Chord chart export and printing</li>
      </Text>
    </Box>
  );
}
