import { Box, Stack, Group, ActionIcon, Text, Paper, Loader } from "@mantine/core";
import { IconPlayerPlay, IconPlayerPause } from "@tabler/icons-react";
import { WaveformTrack } from "./WaveformTrack";
import { useMultiTrackPlayer } from "../../../../hooks/useMultiTrackPlayer";
import { TrackStem } from "../../../../api/types";

interface MultiTrackViewProps {
  tracks: TrackStem[];
  trackId: string;
}

export function MultiTrackView({ tracks, trackId }: MultiTrackViewProps) {
  const player = useMultiTrackPlayer({ tracks, trackId });

  const { state, play, pause, toggleMute, toggleSolo } = player;

  const handlePlayPause = () => {
    if (state.isPlaying) {
      pause();
    } else {
      play();
    }
  };

  if (state.loading) {
    return (
      <Box p="xl" ta="center">
        <Loader size="lg" />
        <Text mt="md" c="dimmed">
          Loading track stems...
        </Text>
      </Box>
    );
  }

  const sortedTracks = [...tracks].sort((a, b) => a.order - b.order);

  return (
    <Box>
      {/* Master controls */}
      <Paper p="md" mb="lg" withBorder>
        <Group justify="space-between">
          <Group>
            <ActionIcon
              size="lg"
              variant="filled"
              color="blue"
              onClick={handlePlayPause}
            >
              {state.isPlaying ? (
                <IconPlayerPause size={20} />
              ) : (
                <IconPlayerPlay size={20} />
              )}
            </ActionIcon>

            <Box>
              <Text size="sm" fw={500}>
                {state.isPlaying ? "Playing" : "Paused"}
              </Text>
              <Text size="xs" c="dimmed">
                {Math.floor(state.position)}s / {Math.floor(state.duration)}s
              </Text>
            </Box>
          </Group>

          <Text size="sm" c="dimmed">
            {sortedTracks.length} track{sortedTracks.length !== 1 ? "s" : ""}
          </Text>
        </Group>
      </Paper>

      {/* Track list */}
      <Stack gap="md">
        {sortedTracks.map((track) => {
          const trackState = state.tracks.get(track.id);

          return (
            <WaveformTrack
              key={track.id}
              track={track}
              trackId={trackId}
              isMuted={trackState?.muted || false}
              isSolo={trackState?.solo || false}
              position={state.position}
              onToggleMute={() => toggleMute(track.id)}
              onToggleSolo={() => toggleSolo(track.id)}
            />
          );
        })}
      </Stack>
    </Box>
  );
}
