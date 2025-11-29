/**
 * Player route layout component and data loader.
 *
 * React Router route: "/" (configured in routes.ts)
 *
 * Responsibilities:
 * - Fetches application data via clientLoader (catalog and photos)
 * - Provides data to child routes via React Router's data API
 * - Handles loading errors with ErrorBoundary
 * - Optimizes revalidation to prevent unnecessary refetches
 *
 * Data ownership:
 * - catalog: AudioCatalog - fetched from API, passed to child routes
 * - photos: string[] - fetched from API, passed to child routes
 *
 * Network calls:
 * - fetchAudioCatalog(): GET {CANCIONES_API_URL}/catalog.yml
 *   Returns: AudioCatalog with song list
 * - fetchPhotos(): GET {FOTOS_API_URL}/
 *   Returns: Photo URLs array
 *
 * Child routes: PlayerIndex (pages/player/index.tsx), TrackLayout (pages/player/track/layout.tsx)
 */
import { Outlet, useRouteError, useNavigate } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import { Paper, Title, Text, Button, Box } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import { fetchAudioCatalog, fetchPhotos } from "../../api/media";
import { AppShell, Anchor, ScrollArea, Burger, Group } from "@mantine/core";
import { useAudioPlayer } from "../../hooks/useAudioPlayer";
import { AudioFileRecord } from "../../api/types";
import { Track } from "./Track";
import { PlayControl } from "./PlayControl";

/**
 * Revalidation strategy for the player route.
 *
 * Prevents refetching catalog when only query params change (track selection, slideshow toggle).
 * Only revalidates when the pathname changes or on initial load.
 */
export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate,
}) => {
  // Don't refetch catalog when just changing query params (track selection, slideshow toggle)
  // Only refetch if pathname changes or if it's the initial load
  if (currentUrl.pathname === nextUrl.pathname) {
    return false;
  }

  return defaultShouldRevalidate;
};

/**
 * Client-side data loader for the player route.
 *
 * Executes before rendering the route to fetch required data.
 * Fetches catalog and photos in parallel for optimal performance.
 *
 * Network calls:
 * - fetchAudioCatalog(): Fetches catalog.yml and enriches songs with URLs
 * - fetchPhotos(): Fetches photo list (fails gracefully if unavailable)
 *
 * @returns Promise resolving to { catalog: AudioCatalog, photos: string[] }
 * @throws Response with 404 if no songs found
 * @throws Response with 500 if catalog fetch fails
 */
export async function clientLoader() {
  try {
    const [catalog, photos] = await Promise.all([
      fetchAudioCatalog(),
      fetchPhotos().catch(() => []), // Photos optional - fail gracefully
    ]);

    if (!catalog || catalog.songs.length === 0) {
      throw new Response("No songs found in catalog", { status: 404 });
    }

    return {
      catalog,
      photos,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response("Failed to load music catalog", {
      status: 500,
      statusText: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

/**
 * Error boundary for the player route.
 *
 * Displays user-friendly error messages when data loading fails.
 * Provides retry and navigation options.
 *
 * Data sources: useRouteError hook (error from clientLoader)
 */
export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Paper
      style={{
        padding: "2rem",
        textAlign: "center",
        minHeight: "100dvh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <Box>
        <Title order={4} mb="md">
          Unable to Load Music Catalog
        </Title>
        <Text mb="xl">
          {error instanceof Response
            ? error.statusText
            : error instanceof Error
              ? error.message
              : "Unknown error occurred"}
        </Text>
        <Button
          variant="filled"
          onClick={() => window.location.reload()}
          style={{ marginRight: "1rem" }}
        >
          Retry
        </Button>
        <Button variant="outline" onClick={() => navigate("/")}>
          Go Home
        </Button>
      </Box>
    </Paper>
  );
}

/**
 * Player layout component.
 *
 * Simple passthrough component that renders child routes.
 * Data loaded by clientLoader is automatically available to child routes.
 *
 * Child routes: PlayerIndex receives catalog and photos via useMatches/useLoaderData
 */
export default function PlayerLayout({ loaderData }: any) {
  const { catalog } = loaderData;
  const [opened, { toggle }] = useDisclosure();
  const { audioState, setAudioState, handleTrackSelect, playNext, playPrev } =
    useAudioPlayer({ catalog });

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
        height: 30,
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
                onCloseMobile={toggle}
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
        <Outlet />
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
