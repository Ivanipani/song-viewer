/**
 * Loading skeleton for the player interface.
 *
 * Parent components: HydrateFallback (from root.tsx)
 *
 * Responsibilities:
 * - Displays placeholder UI during app hydration/loading
 * - Mimics the layout of the actual player (track list + photo viewer)
 * - Provides instant visual feedback before data loads
 *
 * Layout structure:
 * - Left sidebar: 8 track item skeletons + control panel skeleton
 * - Right main area: large photo viewer skeleton
 *
 * No data ownership - purely presentational loading state.
 * No network calls - static skeleton UI.
 */
import { Box, Paper, Skeleton } from '@mantine/core';

export function PlayerSkeleton() {
  return (
    <Paper
      shadow="md"
      style={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '100dvh',
        minHeight: '100dvh',
      }}
    >
      {/* Track list skeleton */}
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          maxWidth: '30%',
          padding: '1rem',
        }}
      >
        {[...Array(8)].map((_, i) => (
          <Skeleton
            key={i}
            height={60}
            style={{ marginBottom: '0.5rem', borderRadius: '4px' }}
          />
        ))}
        {/* Control skeleton */}
        <Box style={{ marginTop: 'auto' }}>
          <Skeleton width="60%" height={30} style={{ marginBottom: '0.5rem' }} />
          <Skeleton height={8} style={{ marginBottom: '1rem' }} />
          <Box style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem' }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} circle height={40} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Photo viewer skeleton */}
      <Box style={{ flex: 1.5, padding: '2.5rem' }}>
        <Skeleton height="100%" />
      </Box>
    </Paper>
  );
}
