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
import { Box, Text, Paper, Stack, Badge, Group, Title, Alert } from "@mantine/core";
import { useParams, useMatches } from "react-router";
import { useEffect, useState } from "react";
import { fetchTrackNotes, fetchTrackMetadata } from "../../../api/media";
import { TrackNotes, ExtendedMetadata, AudioCatalog } from "../../../api/types";
import ReactMarkdown from "react-markdown";
import { IconInfoCircle } from "@tabler/icons-react";

export default function NotesView() {
  const { trackId } = useParams();
  const matches = useMatches();
  const [notes, setNotes] = useState<TrackNotes | null>(null);
  const [metadata, setMetadata] = useState<ExtendedMetadata | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Get catalog from parent route
  const parentMatch = matches.find(
    (match) =>
      match.data && typeof match.data === "object" && "catalog" in match.data,
  );
  const parentData = parentMatch?.data as { catalog?: AudioCatalog } | undefined;
  const catalog = parentData?.catalog;

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
                h1: ({ children }) => <Title order={2} mb="sm">{children}</Title>,
                h2: ({ children }) => <Title order={3} mb="sm">{children}</Title>,
                h3: ({ children }) => <Title order={4} mb="sm">{children}</Title>,
                p: ({ children }) => <Text mb="sm">{children}</Text>,
                ul: ({ children }) => <Box component="ul" ml="md" mb="sm">{children}</Box>,
                ol: ({ children }) => <Box component="ol" ml="md" mb="sm">{children}</Box>,
                li: ({ children }) => <Text component="li">{children}</Text>,
                code: ({ children }) => (
                  <Text component="code" ff="monospace" bg="dark.6" p="2px 6px" style={{ borderRadius: 4 }}>
                    {children}
                  </Text>
                ),
                blockquote: ({ children }) => (
                  <Paper p="sm" bg="dark.7" mb="sm" style={{ borderLeft: "4px solid var(--mantine-color-blue-6)" }}>
                    {children}
                  </Paper>
                ),
                strong: ({ children }) => <Text component="strong" fw={700}>{children}</Text>,
                em: ({ children }) => <Text component="em" fs="italic">{children}</Text>,
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
                <Title order={4} mb="md">Performance</Title>
                <Stack gap="xs">
                  {metadata.performance.date && (
                    <Group gap="xs">
                      <Text fw={500}>Date:</Text>
                      <Text>{metadata.performance.date}</Text>
                    </Group>
                  )}
                  {metadata.performance.location && (
                    <Group gap="xs">
                      <Text fw={500}>Location:</Text>
                      <Text>{metadata.performance.location}</Text>
                    </Group>
                  )}
                  {metadata.performance.mood && (
                    <Group gap="xs">
                      <Text fw={500}>Mood:</Text>
                      <Badge>{metadata.performance.mood}</Badge>
                    </Group>
                  )}
                  {metadata.performance.take_number !== undefined && (
                    <Group gap="xs">
                      <Text fw={500}>Take:</Text>
                      <Text>{metadata.performance.take_number}</Text>
                    </Group>
                  )}
                  {metadata.performance.improvised !== undefined && (
                    <Group gap="xs">
                      <Text fw={500}>Improvised:</Text>
                      <Text>{metadata.performance.improvised ? "Yes" : "No"}</Text>
                    </Group>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Music Theory */}
            {metadata.theory && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Music Theory</Title>
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
                  {metadata.theory.chord_progression && metadata.theory.chord_progression.length > 0 && (
                    <Box>
                      <Text fw={500} mb="xs">Chord Progression:</Text>
                      <Group gap="xs">
                        {metadata.theory.chord_progression.map((entry, idx) => (
                          <Badge key={idx} variant="light">
                            {entry.chord}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                  )}
                  {metadata.theory.techniques && metadata.theory.techniques.length > 0 && (
                    <Box>
                      <Text fw={500} mb="xs">Techniques:</Text>
                      <Group gap="xs">
                        {metadata.theory.techniques.map((tech, idx) => (
                          <Badge key={idx} color="grape" variant="light">
                            {tech}
                          </Badge>
                        ))}
                      </Group>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Recording Details */}
            {metadata.recording && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Recording</Title>
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
                  {metadata.recording.sample_rate && (
                    <Group gap="xs">
                      <Text fw={500}>Sample Rate:</Text>
                      <Text>{metadata.recording.sample_rate} Hz</Text>
                    </Group>
                  )}
                  {metadata.recording.bit_depth && (
                    <Group gap="xs">
                      <Text fw={500}>Bit Depth:</Text>
                      <Text>{metadata.recording.bit_depth} bit</Text>
                    </Group>
                  )}
                  {metadata.recording.effects && metadata.recording.effects.length > 0 && (
                    <Box>
                      <Text fw={500} mb="xs">Effects:</Text>
                      <Stack gap="xs">
                        {metadata.recording.effects.map((effect, idx) => (
                          <Text key={idx} size="sm" c="dimmed">
                            {Object.entries(effect).map(([key, value]) => `${key}: ${value}`).join(", ")}
                          </Text>
                        ))}
                      </Stack>
                    </Box>
                  )}
                </Stack>
              </Paper>
            )}

            {/* Lyrics */}
            {metadata.lyrics?.content && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">
                  Lyrics {metadata.lyrics.language && `(${metadata.lyrics.language})`}
                </Title>
                <Text style={{ whiteSpace: "pre-wrap" }} ff="monospace" size="sm">
                  {metadata.lyrics.content}
                </Text>
              </Paper>
            )}

            {/* Additional Info */}
            {(metadata.inspiration || metadata.tags || metadata.related_tracks) && (
              <Paper p="md" withBorder>
                <Title order={4} mb="md">Additional Information</Title>
                <Stack gap="sm">
                  {metadata.inspiration && (
                    <Box>
                      <Text fw={500} mb="xs">Inspiration:</Text>
                      <Text c="dimmed" fs="italic">{metadata.inspiration}</Text>
                    </Box>
                  )}
                  {metadata.tags && metadata.tags.length > 0 && (
                    <Box>
                      <Text fw={500} mb="xs">Tags:</Text>
                      <Group gap="xs">
                        {metadata.tags.map((tag, idx) => (
                          <Badge key={idx} variant="dot">{tag}</Badge>
                        ))}
                      </Group>
                    </Box>
                  )}
                  {metadata.related_tracks && metadata.related_tracks.length > 0 && (
                    <Box>
                      <Text fw={500} mb="xs">Related Tracks:</Text>
                      <Stack gap="xs">
                        {metadata.related_tracks.map((relatedId, idx) => {
                          const relatedTrack = catalog?.songs.find(s => s.id === relatedId);
                          return (
                            <Text key={idx} size="sm" c="blue" style={{ cursor: "pointer" }}>
                              {relatedTrack ? `${relatedTrack.title} - ${relatedTrack.artist}` : relatedId}
                            </Text>
                          );
                        })}
                      </Stack>
                    </Box>
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
