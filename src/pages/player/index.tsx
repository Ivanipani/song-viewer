/**
 * Main player page component.
 *
 * React Router route: "/" index route (configured in routes.ts)
 *
 * Component hierarchy:
 * PlayerIndex
 *   ├─ AppShell (Mantine layout)
 *   │   ├─ AppShell.Header (mobile only - burger menu)
 *   │   ├─ AppShell.Navbar
 *   │   │   ├─ Track (multiple - one per song in catalog)
 *   │   │   └─ PlayControl (player controls in sidebar)
 *   │   ├─ AppShell.Main
 *   │   │   └─ PhotoViewer (when slideshow=true in URL)
 *   │   └─ AppShell.Footer (GitHub link)
 *
 * Data ownership:
 * - catalog: AudioCatalog - received from parent route (PlayerLayout) via useMatches
 * - photos: string[] - received from parent route (PlayerLayout) via useMatches
 * - audioState: AudioState - owned by useAudioPlayer hook
 *   Contains: selectedTrack, sound (Howl instance), isPlaying, position, duration, loop, shuffle
 * - currentPhotoIndex: number - local state for slideshow
 * - opened: boolean - local state for mobile navbar
 *
 * Data sources:
 * - Parent route data: catalog and photos fetched by PlayerLayout's clientLoader
 * - URL query params: ?track=<id>&slideshow=true
 * - useAudioPlayer: Manages all audio playback state and URL sync
 *
 * No direct network calls - data comes from parent route loader.
 */
import { useState, useEffect } from "react";
import { useSearchParams, useMatches } from "react-router";
import {
  AppShell,
  Box,
  Anchor,
  ScrollArea,
  Burger,
  Text,
  Group,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { AudioCatalog, AudioFileRecord } from "../../api/types";
import { Track } from "./Track";
import { PlayControl } from "./PlayControl";
import { PhotoViewer } from "./PhotoViewer";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export default function PlayerIndex() {
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
  const [opened, { toggle }] = useDisclosure();

  // Find parent route data - check all matches for data
  const parentMatch = matches.find(
    (match) => match.data && typeof match.data === "object" && "catalog" in match.data,
  );
  const parentData = parentMatch?.data as
    | { catalog: AudioCatalog; photos: string[] }
    | undefined;

  const catalog = parentData?.catalog;
  const photos = parentData?.photos || [];

  const showSlideshow = searchParams.get("slideshow") === "true";

  const { audioState, setAudioState, handleTrackSelect, playNext, playPrev } =
    useAudioPlayer({ catalog });

  useEffect(() => {
    if (!showSlideshow || photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [showSlideshow, photos]);

  if (!catalog) {
    return null;
  }

  return (
    <AppShell
      navbar={{
        width: { base: 280, sm: 300 },
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      header={{
        height: { base: 60, sm: 0 },
      }}
      footer={{
        height: 40,
      }}
      padding={0}
    >
      <AppShell.Header hiddenFrom="sm">
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            height: "100%",
            padding: "0 1rem",
          }}
        >
          <Burger opened={opened} onClick={toggle} size="sm" />
          <Text ml="md">Song Viewer</Text>
        </Box>
      </AppShell.Header>

      <AppShell.Navbar>
        <AppShell.Section grow component={ScrollArea}>
          <Box p="md">
            {catalog.songs.map((track: AudioFileRecord) => (
              <Track
                key={track.id}
                track={track}
                selectedTrack={audioState.selectedTrack}
                setSelectedTrack={handleTrackSelect}
              />
            ))}
          </Box>
        </AppShell.Section>

        <AppShell.Section>
          <PlayControl
            audioState={audioState}
            setAudioState={setAudioState}
            playNext={playNext}
            playPrev={playPrev}
            showTrackPlayer={() => {}}
          />
        </AppShell.Section>
      </AppShell.Navbar>

      <AppShell.Main>
        {showSlideshow && photos.length > 0 ? (
          <PhotoViewer photos={photos} currentPhotoIndex={currentPhotoIndex} />
        ) : (
          <Box
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              height: "100%",
              padding: "2rem",
            }}
          >
            {/* <Text size="lg" c="dimmed"> */}
            {/*   Enable slideshow to view photos */}
            {/* </Text> */}
          </Box>
        )}
      </AppShell.Main>

      <AppShell.Footer p="md">
        <Group justify="flex-end">
          {/* <Text size="sm" c="dimmed"> */}
          {/*   A simple music player with photo slideshow support */}
          {/* </Text> */}
          <Anchor
            href="https://github.com/Ivanipani/song-viewer"
            target="_blank"
            size="sm"
          >
            View on GitHub
          </Anchor>
        </Group>
      </AppShell.Footer>
    </AppShell>
  );
}
