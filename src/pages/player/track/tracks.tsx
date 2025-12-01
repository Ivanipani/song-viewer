/**
 * Track stems/layers view component for track details.
 *
 * React Router route: "/track/:trackId/tracks" (configured in routes.ts)
 *
 * Parent component: TrackLayout (track/layout.tsx)
 *
 * Responsibilities:
 * - Displays individual track stems with waveform visualizations
 * - Provides solo/mute controls for each track
 * - Synchronized multi-track playback
 *
 * Data sources:
 * - Metadata: GET /media/{trackId}/metadata.yml
 */
import { Box, Text } from "@mantine/core";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { fetchTrackMetadata } from "../../../api/media";
import { ExtendedMetadata } from "../../../api/types";
import { MultiTrackView } from "./components/MultiTrackView";

export default function TracksView() {
  const { trackId } = useParams();
  const [metadata, setMetadata] = useState<ExtendedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!trackId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const metadataData = await fetchTrackMetadata(trackId);
        setMetadata(metadataData);
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Failed to load track metadata"
        );
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [trackId]);

  if (loading) {
    return (
      <Box p="lg">
        <Text c="dimmed">Loading track stems...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="lg">
        <Text c="red">Error: {error}</Text>
      </Box>
    );
  }

  if (!metadata?.mixing || !metadata.mixing.tracks || metadata.mixing.tracks.length === 0) {
    return (
      <Box p="lg">
        <Text size="lg" c="dimmed">
          Track stems not available for this song
        </Text>
        <Text size="sm" c="dimmed" mt="md">
          This song hasn't been linked to a mixing project yet.
        </Text>
      </Box>
    );
  }

  if (!trackId) {
    return (
      <Box p="lg">
        <Text c="red">Error: No track ID provided</Text>
      </Box>
    );
  }

  return (
    <Box p="lg">
      <MultiTrackView tracks={metadata.mixing.tracks} trackId={trackId} />
    </Box>
  );
}
