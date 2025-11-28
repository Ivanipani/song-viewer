import { useState, useEffect } from "react";
import { useSearchParams, useMatches } from "react-router";
import { AppShell, Box, Text, Anchor, ScrollArea } from "@mantine/core";
import { AudioCatalog, AudioFileRecord } from "../../api/types";
import { Track } from "./Track";
import { PlayControl } from "./PlayControl";
import { PhotoViewer } from "./PhotoViewer";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";

export default function PlayerIndex() {
  const matches = useMatches();
  const [searchParams] = useSearchParams();
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

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
        width: 300,
        breakpoint: "sm",
      }}
      footer={{
        height: 60,
      }}
      padding={0}
    >
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
        <Box
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "flex-end",
          }}
        >
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
        </Box>
      </AppShell.Footer>
    </AppShell>
  );
}
