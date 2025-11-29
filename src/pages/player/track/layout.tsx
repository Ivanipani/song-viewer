/**
 * Track detail layout component.
 *
 * React Router route: "/track/:trackId" (configured in routes.ts)
 *
 * Component hierarchy:
 * TrackLayout
 *   ├─ Metadata Header
 *   │   ├─ Title (track title)
 *   │   ├─ Text (artist name)
 *   │   └─ SegmentedControl (Notes | Chords | Tracks)
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
import type { Route } from "./+types/layout";
import {
  useParams,
  useMatches,
  Outlet,
  useNavigate,
  useLocation,
} from "react-router";
import {
  Box,
  Title,
  Text,
  Paper,
  SegmentedControl,
  ScrollArea,
} from "@mantine/core";
import { AudioCatalog } from "../../../api/types";

export default function TrackLayout({}: Route.ComponentProps) {
  const { trackId } = useParams();
  const matches = useMatches();
  const navigate = useNavigate();
  const location = useLocation();

  // Get catalog from parent route
  const parentMatch = matches.find(
    (match) =>
      match.data && typeof match.data === "object" && "catalog" in match.data,
  );
  const parentData = parentMatch?.data as
    | { catalog?: AudioCatalog }
    | undefined;
  const catalog = parentData?.catalog;

  // Find the selected track
  const track = catalog?.songs.find((song) => song.id === trackId);

  // Determine current view from pathname
  const getCurrentView = () => {
    const path = location.pathname;
    if (path.endsWith("/chords")) return "chords";
    if (path.endsWith("/tracks")) return "tracks";
    return "notes"; // Default/index route
  };

  const currentView = getCurrentView();

  // Handle view change
  const handleViewChange = (value: string) => {
    if (value === "notes") {
      navigate(`/track/${trackId}`);
    } else {
      navigate(`/track/${trackId}/${value}`);
    }
  };

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
        height: "calc(100vh - 90px)", // 100vh - header(60px) - footer(30px) for mobile
        overflow: "hidden",
      }}
      sx={{
        "@media (min-width: 768px)": {
          height: "calc(100vh - 30px)", // 100vh - footer(30px) for desktop (no header)
        },
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

        {/* View Toggle Control */}
        <SegmentedControl
          mt="md"
          value={currentView}
          onChange={handleViewChange}
          data={[
            { label: "Notes", value: "notes" },
            { label: "Chords", value: "chords" },
            { label: "Tracks", value: "tracks" },
          ]}
        />
      </Paper>

      {/* Content Area - renders nested route */}
      <ScrollArea h="0" style={{ flex: 1 }}>
        <Outlet />
      </ScrollArea>
    </Box>
  );
}
