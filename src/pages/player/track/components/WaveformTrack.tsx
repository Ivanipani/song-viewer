import { useEffect, useRef, useState } from "react";
import { Box, Group, ActionIcon, Text, Skeleton } from "@mantine/core";
import WaveSurfer from "wavesurfer.js";
import { TrackStem } from "../../../../api/types";
import { MEDIA_API_URL } from "../../../../api/config";

interface WaveformTrackProps {
  track: TrackStem;
  trackId: string;
  isMuted: boolean;
  isSolo: boolean;
  position: number;
  onToggleMute: () => void;
  onToggleSolo: () => void;
}

export function WaveformTrack({
  track,
  trackId,
  isMuted,
  isSolo,
  position,
  onToggleMute,
  onToggleSolo,
}: WaveformTrackProps) {
  const waveformRef = useRef<HTMLDivElement>(null);
  const wavesurferRef = useRef<WaveSurfer | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize WaveSurfer with peaks data
  useEffect(() => {
    if (!waveformRef.current) return;

    const peaksUrl = `${MEDIA_API_URL}/${trackId}/${track.peaks_url}`;
    // Prefer OGG for better Web Audio API compatibility
    const audioFile = track.audio_files.find((f) => f.format === "ogg") ||
                      track.audio_files.find((f) => f.format === "mp3") ||
                      track.audio_files[0];

    if (!audioFile) {
      setError("No audio file available");
      setLoading(false);
      return;
    }

    const audioUrl = `${MEDIA_API_URL}/${trackId}/${audioFile.url}`;

    console.log(`Loading waveform for ${track.name}`, { peaksUrl, audioUrl });

    // Set timeout to prevent infinite loading
    const loadTimeout = setTimeout(() => {
      console.warn(`Waveform loading timeout for ${track.name}`);
      setLoading(false);
    }, 5000);

    // Load peaks data first
    fetch(peaksUrl)
      .then((response) => {
        if (!response.ok) {
          throw new Error(`Failed to load peaks: ${response.statusText}`);
        }
        return response.json();
      })
      .then((peaksData) => {
        console.log(`Peaks loaded for ${track.name}`, peaksData);

        // Create WaveSurfer instance with peaks
        const wavesurfer = WaveSurfer.create({
          container: waveformRef.current!,
          waveColor: track.color + "80", // Add transparency
          progressColor: track.color,
          cursorColor: track.color,
          barWidth: 2,
          barGap: 1,
          barRadius: 2,
          height: 64,
          normalize: true,
          interact: false, // Disable clicking on waveform
          url: audioUrl,
          peaks: [peaksData.data], // Provide pre-computed peaks
        });

        wavesurferRef.current = wavesurfer;

        // Wait for waveform to be ready
        wavesurfer.on('ready', () => {
          console.log(`WaveSurfer ready for ${track.name}`);
          clearTimeout(loadTimeout);
          setLoading(false);
        });

        wavesurfer.on('error', (err) => {
          console.error(`WaveSurfer error for ${track.name}:`, err);
          clearTimeout(loadTimeout);
          setError("Failed to load waveform");
          setLoading(false);
        });

        // Fallback: if peaks are provided, show waveform immediately
        setTimeout(() => {
          if (wavesurferRef.current) {
            console.log(`Forcing waveform display for ${track.name}`);
            clearTimeout(loadTimeout);
            setLoading(false);
          }
        }, 1000);
      })
      .catch((err) => {
        console.error(`Failed to load peaks for ${track.name}:`, err);
        clearTimeout(loadTimeout);
        setError("Failed to load waveform");
        setLoading(false);
      });

    return () => {
      if (wavesurferRef.current) {
        wavesurferRef.current.destroy();
        wavesurferRef.current = null;
      }
    };
  }, [track, trackId]);

  // Update waveform position
  useEffect(() => {
    if (wavesurferRef.current && !loading) {
      const duration = wavesurferRef.current.getDuration();
      if (duration > 0) {
        const progress = position / duration;
        wavesurferRef.current.seekTo(progress);
      }
    }
  }, [position, loading]);

  if (error) {
    return (
      <Box p="md" style={{ border: `1px solid ${track.color}`, borderRadius: 4 }}>
        <Text c="dimmed" size="sm">
          {error}
        </Text>
      </Box>
    );
  }

  return (
    <Box>
      <Group justify="space-between" mb="xs">
        <Group gap="xs">
          {/* Color indicator */}
          <Box
            w={12}
            h={12}
            style={{
              backgroundColor: track.color,
              borderRadius: 2,
            }}
          />
          <Text size="sm" fw={500}>
            {track.name}
          </Text>
        </Group>

        <Group gap="xs">
          {/* Solo button */}
          <ActionIcon
            variant="filled"
            size="sm"
            onClick={onToggleSolo}
            title={isSolo ? "Unsolo track" : "Solo track"}
            style={{
              backgroundColor: isSolo ? "gold" : "var(--mantine-color-default-border)",
              color: isSolo ? "var(--mantine-color-default-border)" : "gold",
            }}
          >
            <Text size="xs" fw={700}>S</Text>
          </ActionIcon>

          {/* Mute button */}
          <ActionIcon
            variant="filled"
            size="sm"
            onClick={onToggleMute}
            title={isMuted ? "Unmute track" : "Mute track"}
            style={{
              backgroundColor: isMuted ? "red" : "var(--mantine-color-default-border)",
              color: isMuted ? "var(--mantine-color-default-border)" : "red",
            }}
          >
            <Text size="xs" fw={700}>M</Text>
          </ActionIcon>
        </Group>
      </Group>

      {/* Waveform */}
      {loading ? (
        <Skeleton height={64} radius="sm" />
      ) : (
        <Box
          ref={waveformRef}
          style={{
            border: `1px solid var(--mantine-color-default-border)`,
            borderRadius: 4,
            overflow: "hidden",
          }}
        />
      )}
    </Box>
  );
}
