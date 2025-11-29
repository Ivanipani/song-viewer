/**
 * Track detail layout component.
 *
 * React Router route: "/track/:trackId" (configured in routes.ts)
 *
 * Component hierarchy:
 * TrackLayout
 *   ├─ Metadata Header
 *   │   ├─ Title (track title)
 *   │   └─ Text (artist name)
 *   ├─ Navigation Tabs (Notes | Chords | Tracks)
 *   └─ Outlet (renders nested view: notes/chords/tracks)
 *
 * Responsibilities:
 * - Extracts trackId from URL params
 * - Retrieves catalog from parent route
 * - Finds and displays selected track metadata
 * - Provides navigation between different track views
 * - Renders child view components via Outlet
 *
 * Data sources:
 * - trackId: from URL params (useParams)
 * - catalog: from parent route (useMatches)
 *
 * Data flow:
 * - Receives catalog from PlayerLayout's clientLoader
 * - Finds track by matching trackId with catalog.songs
 * - Child routes can access track data via context (future enhancement)
 *
 * No network calls - operates on parent route's data.
 */
import { useParams, useMatches, Outlet, NavLink } from "react-router";
import { Box, Title, Text, Group, Paper } from "@mantine/core";
import { AudioCatalog } from "../../../api/types";

export default function TrackLayout() {
  const { trackId } = useParams();
  const matches = useMatches();

  // Get catalog from parent route
  const parentMatch = matches.find(
    (match) => match.data && typeof match.data === "object" && "catalog" in match.data
  );
  const parentData = parentMatch?.data as { catalog?: AudioCatalog } | undefined;
  const catalog = parentData?.catalog;

  // Find the selected track
  const track = catalog?.songs.find((song) => song.id === trackId);

  // Handle track not found
  if (!track) {
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
        <Text size="lg" c="dimmed">
          Track not found
        </Text>
      </Box>
    );
  }

  return (
    <Box
      style={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Metadata Header */}
      <Paper
        p="md"
        style={{
          borderBottom: "1px solid var(--mantine-color-dark-4)",
        }}
      >
        <Title order={3}>{track.title}</Title>
        <Text c="dimmed" size="sm">
          {track.artist}
        </Text>

        {/* View Toggle Buttons */}
        <Group mt="md" gap="xs">
          <NavLink
            to={`/track/${trackId}`}
            end
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              color: isActive ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-5)",
              backgroundColor: isActive ? "var(--mantine-color-dark-6)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Notes
          </NavLink>
          <NavLink
            to={`/track/${trackId}/chords`}
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              color: isActive ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-5)",
              backgroundColor: isActive ? "var(--mantine-color-dark-6)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Chords
          </NavLink>
          <NavLink
            to={`/track/${trackId}/tracks`}
            style={({ isActive }) => ({
              padding: "0.5rem 1rem",
              borderRadius: "4px",
              textDecoration: "none",
              color: isActive ? "var(--mantine-color-blue-6)" : "var(--mantine-color-gray-5)",
              backgroundColor: isActive ? "var(--mantine-color-dark-6)" : "transparent",
              fontWeight: isActive ? 600 : 400,
            })}
          >
            Tracks
          </NavLink>
        </Group>
      </Paper>

      {/* Content Area - renders nested route */}
      <Box style={{ flex: 1, overflow: "auto" }}>
        <Outlet />
      </Box>
    </Box>
  );
}
