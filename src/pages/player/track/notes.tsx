/**
 * Notes view component for track details.
 *
 * React Router route: "/track/:trackId/notes" (configured in routes.ts)
 * Also serves as index route: "/track/:trackId"
 *
 * Parent component: TrackLayout (track/layout.tsx)
 *
 * Responsibilities:
 * - Fetches and displays markdown notes for the selected track
 * - Fetches and displays extended metadata (performance, recording, theory info)
 * - Handles loading states and errors gracefully
 * - Displays empty state when no content is available
 *
 * Data sources:
 * - Notes: GET /tracks/{trackId}/notes.md
 * - Metadata: GET /tracks/{trackId}/metadata.yml
 * - Track info from parent route catalog
 */
import {
  Box,
  Text,
  Paper,
  Stack,
  Badge,
  Group,
  Title,
  Alert,
  useComputedColorScheme,
} from "@mantine/core";
import { useParams } from "react-router";
import { useEffect, useState } from "react";
import { fetchTrackNotes, fetchTrackMetadata } from "../../../api/media";
import { TrackNotes, ExtendedMetadata } from "../../../api/types";
import ReactMarkdown from "react-markdown";
import { IconInfoCircle } from "@tabler/icons-react";

export default function NotesView() {
  const { trackId } = useParams();
  const computedColorScheme = useComputedColorScheme('light');
  const [notes, setNotes] = useState<TrackNotes | null>(null);
  const [metadata, setMetadata] = useState<ExtendedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    if (!trackId) return;

    const loadData = async () => {
      setLoading(true);
      setError(null);
      try {
        const [notesData, metadataData] = await Promise.all([
          fetchTrackNotes(trackId),
          fetchTrackMetadata(trackId),
        ]);
        setNotes(notesData);
        setMetadata(metadataData);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load track data");
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [trackId]);

  if (loading) {
    return (
      <Box p="lg">
        <Text c="dimmed">Loading notes...</Text>
      </Box>
    );
  }

  if (error) {
    return (
      <Box p="lg">
        <Alert color="red" title="Error">
          {error}
        </Alert>
      </Box>
    );
  }

  const hasContent = notes?.content || metadata;

  if (!hasContent) {
    return (
      <Box p="lg">
        <Alert icon={<IconInfoCircle />} color="blue">
          No notes or extended metadata available for this track.
        </Alert>
      </Box>
    );
  }

  return (
    <Box p="lg">
      <Stack gap="xl">
        {/* Markdown Notes Section */}
        {notes?.content && (
          <Paper p="md" withBorder>
            <ReactMarkdown
              components={{
                h1: ({ children }) => (
                  <Title order={2} mb="sm">
                    {children}
                  </Title>
                ),
                h2: ({ children }) => (
                  <Title order={3} mb="sm">
                    {children}
                  </Title>
                ),
                h3: ({ children }) => (
                  <Title order={4} mb="sm">
                    {children}
                  </Title>
                ),
                p: ({ children }) => <Text mb="sm">{children}</Text>,
                ul: ({ children }) => (
                  <Box component="ul" ml="md" mb="sm">
                    {children}
                  </Box>
                ),
                ol: ({ children }) => (
                  <Box component="ol" ml="md" mb="sm">
                    {children}
                  </Box>
                ),
                li: ({ children }) => <Text component="li">{children}</Text>,
                code: ({ children }) => (
                  <Text
                    component="code"
                    ff="monospace"
                    bg={
                      computedColorScheme === "dark"
                        ? "rgba(0, 229, 255, 0.1)"
                        : "neonCyan.1"
                    }
                    p="2px 6px"
                    style={{
                      borderRadius: 4,
                      border: "1px solid rgba(0, 229, 255, 0.3)"
                    }}
                  >
                    {children}
                  </Text>
                ),
                blockquote: ({ children }) => (
                  <Paper
                    p="sm"
                    bg={
                      computedColorScheme === "dark"
                        ? "rgba(0, 229, 255, 0.05)"
                        : "neonCyan.0"
                    }
                    mb="sm"
                    style={{
                      borderLeft: "4px solid var(--mantine-color-neonCyan-6)",
                      boxShadow: "-4px 0 8px rgba(0, 229, 255, 0.2)",
                    }}
                  >
                    {children}
                  </Paper>
                ),
                strong: ({ children }) => (
                  <Text component="strong" fw={700}>
                    {children}
                  </Text>
                ),
                em: ({ children }) => (
                  <Text component="em" fs="italic">
                    {children}
                  </Text>
                ),
              }}
            >
              {notes.content}
            </ReactMarkdown>
          </Paper>
        )}

        {/* Extended Metadata Sections */}
        {metadata && (
          <>
            {/* Performance Information */}
            {metadata.performance && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">
                  Performance
                </Title>
                <Stack gap="xs">
                  {metadata.performance.date && (
                    <Group gap="xs">
                      <Text fw={500}>Date:</Text>
                      <Text>{metadata.performance.date}</Text>
                    </Group>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Music Theory */}
            {metadata.theory && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">
                  Song Structure
                </Title>
                <Stack gap="sm">
                  {metadata.theory.key && (
                    <Group gap="xs">
                      <Text fw={500}>Key:</Text>
                      <Badge size="lg">{metadata.theory.key}</Badge>
                    </Group>
                  )}
                  {metadata.theory.time_signature && (
                    <Group gap="xs">
                      <Text fw={500}>Time Signature:</Text>
                      <Text>{metadata.theory.time_signature}</Text>
                    </Group>
                  )}
                  {metadata.theory.tempo_bpm && (
                    <Group gap="xs">
                      <Text fw={500}>Tempo:</Text>
                      <Text>{metadata.theory.tempo_bpm} BPM</Text>
                    </Group>
                  )}
                  {metadata.theory.scale && (
                    <Group gap="xs">
                      <Text fw={500}>Scale:</Text>
                      <Text>{metadata.theory.scale}</Text>
                    </Group>
                  )}
                  {metadata.theory.chord_progression &&
                    metadata.theory.chord_progression.length > 0 && (
                      <Box>
                        <Text fw={500} mb="xs">
                          Chord Progression:
                        </Text>
                        <Group gap="xs">
                          {metadata.theory.chord_progression.map(
                            (entry, idx) => (
                              <Badge key={idx} variant="light">
                                {entry.chord}
                              </Badge>
                            ),
                          )}
                        </Group>
                      </Box>
                    )}
                </Stack>
              </Paper>
            )}

            {/* Recording Details */}
            {metadata.recording && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">
                  Recording
                </Title>
                <Stack gap="xs">
                  {metadata.recording.microphone && (
                    <Group gap="xs">
                      <Text fw={500}>Microphone:</Text>
                      <Text>{metadata.recording.microphone}</Text>
                    </Group>
                  )}
                  {metadata.recording.interface && (
                    <Group gap="xs">
                      <Text fw={500}>Interface:</Text>
                      <Text>{metadata.recording.interface}</Text>
                    </Group>
                  )}
                  {metadata.recording.daw && (
                    <Group gap="xs">
                      <Text fw={500}>DAW:</Text>
                      <Text>{metadata.recording.daw}</Text>
                    </Group>
                  )}
                </Stack>
              </Paper>
            )}
          </>
        )}
      </Stack>
    </Box>
  );
}
