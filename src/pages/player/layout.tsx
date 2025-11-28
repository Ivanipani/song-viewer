import { Outlet, useRouteError, useNavigate } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import { Paper, Title, Text, Button, Box } from "@mantine/core";
import { fetchAudioCatalog, fetchPhotos } from "../../api/media";

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

export default function PlayerLayout() {
  return <Outlet />;
}
