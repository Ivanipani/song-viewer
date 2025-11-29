/**
 * Notes view component for track details.
 *
 * React Router route: "/track/:trackId/notes" (configured in routes.ts)
 * Also serves as index route: "/track/:trackId"
 *
 * Parent component: TrackLayout (track/layout.tsx)
 *
 * Responsibilities:
 * - Displays notes content for the selected track
 * - Currently shows placeholder text
 * - Future: Rich text editor for user notes
 *
 * Data sources:
 * - Could receive track data from parent via Outlet context (future)
 * - Could load/save notes from localStorage or API (future)
 *
 * No data ownership - placeholder component.
 * No network calls - static content.
 */
import { Box, Text } from "@mantine/core";

export default function NotesView() {
  return (
    <Box p="lg">
      <Text size="lg" c="dimmed">
        Notes content goes here
      </Text>
      <Text size="sm" c="dimmed" mt="md">
        This is a placeholder for track notes. Future enhancements could include:
      </Text>
      <Text size="sm" c="dimmed" component="ul" ml="md" mt="xs">
        <li>Rich text editor for writing and formatting notes</li>
        <li>Auto-save functionality</li>
        <li>Search within notes</li>
        <li>Export to PDF or text</li>
      </Text>
    </Box>
  );
}
