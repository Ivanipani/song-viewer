import { Box, Paper, Skeleton } from '@mui/material';

export function PlayerSkeleton() {
  return (
    <Paper
      elevation={3}
      sx={{
        display: 'flex',
        flexDirection: 'row',
        maxHeight: '100dvh',
        minHeight: '100dvh',
      }}
    >
      {/* Track list skeleton */}
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flex: 1,
          maxWidth: '30%',
          padding: 2,
        }}
      >
        {[...Array(8)].map((_, i) => (
          <Skeleton
            key={i}
            variant="rectangular"
            height={60}
            sx={{ mb: 1, borderRadius: 1 }}
          />
        ))}
        {/* Control skeleton */}
        <Box sx={{ mt: 'auto' }}>
          <Skeleton variant="text" width="60%" height={30} sx={{ mb: 1 }} />
          <Skeleton variant="rectangular" height={8} sx={{ mb: 2 }} />
          <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1 }}>
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} variant="circular" width={40} height={40} />
            ))}
          </Box>
        </Box>
      </Box>

      {/* Photo viewer skeleton */}
      <Box sx={{ flex: 1.5, padding: 10 }}>
        <Skeleton variant="rectangular" height="100%" />
      </Box>
    </Paper>
  );
}
