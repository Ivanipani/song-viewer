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
 * Child routes: PlayerIndex (pages/player/index.tsx)
 */
import { Outlet, useRouteError, useNavigate } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import { Paper, Title, Text, Button, Box } from "@mantine/core";
import { fetchAudioCatalog, fetchPhotos } from "../../api/media";

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
          style={{ marginRight: '1rem' }}
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
export default function PlayerLayout() {
  return <Outlet />;
}
