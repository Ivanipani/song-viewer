import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useNavigation } from "react-router";
import { MantineProvider, Box, Title, Text, Button, Progress } from "@mantine/core";
import { theme } from "./theme";
import { PlayerSkeleton } from "./pages/player/PlayerSkeleton";

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Canciones</title>
        <Meta />
        <Links />
      </head>
      <body>
        {/* <div>{children}</div> */}
        <div id="root">{children}</div>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

function NavigationProgress() {
  const navigation = useNavigation();
  const isNavigating = navigation.state === 'loading';

  return (
    <Progress
      value={100}
      animated
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        opacity: isNavigating ? 1 : 0,
        transition: 'opacity 0.2s',
        visibility: isNavigating ? 'visible' : 'hidden'
      }}
    />
  );
}

function AppContent() {
  return (
    <Box
      style={{
        minHeight: '100dvh',
        maxHeight: '100dvh',
        overflow: "hidden",
      }}
    >
      <Outlet />
    </Box>
  );
}

export function HydrateFallback() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <PlayerSkeleton />
    </MantineProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <Box style={{ padding: '2rem', textAlign: 'center', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <Title order={3} mb="md">Something went wrong</Title>
          <Text style={{ marginTop: '1rem', marginBottom: '1.5rem' }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Text>
          <Button variant="filled" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </Box>
      </Box>
    </MantineProvider>
  );
}

export default function Root() {
  return (
    <MantineProvider theme={theme} defaultColorScheme="dark">
      <NavigationProgress />
      <AppContent />
    </MantineProvider>
  );
}


