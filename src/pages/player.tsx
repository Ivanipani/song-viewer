import { Outlet, useRouteError, useNavigate } from "react-router";
import type { ShouldRevalidateFunction } from "react-router";
import { Paper, Typography, Button, Box } from "@mui/material";
import { fetchAudioCatalog, fetchPhotos } from "../api/media";

export const shouldRevalidate: ShouldRevalidateFunction = ({
  currentUrl,
  nextUrl,
  defaultShouldRevalidate
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
      fetchPhotos().catch(() => []) // Photos optional - fail gracefully
    ]);

    if (!catalog || catalog.songs.length === 0) {
      throw new Response('No songs found in catalog', { status: 404 });
    }

    return {
      catalog,
      photos,
    };
  } catch (error) {
    if (error instanceof Response) throw error;
    throw new Response('Failed to load music catalog', {
      status: 500,
      statusText: error instanceof Error ? error.message : 'Unknown error'
    });
  }
}

export function ErrorBoundary() {
  const error = useRouteError();
  const navigate = useNavigate();

  return (
    <Paper sx={{ padding: 4, textAlign: 'center', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Unable to Load Music Catalog
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {error instanceof Response
            ? error.statusText
            : error instanceof Error
              ? error.message
              : 'Unknown error occurred'}
        </Typography>
        <Button
          variant="contained"
          onClick={() => window.location.reload()}
          sx={{ mr: 2 }}
        >
          Retry
        </Button>
        <Button variant="outlined" onClick={() => navigate('/')}>
          Go Home
        </Button>
      </Box>
    </Paper>
  );
}

export default function PlayerLayout() {
  return <Outlet />;
}

