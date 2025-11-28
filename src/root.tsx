import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useNavigation } from "react-router";
import { CssBaseline, Box, ThemeProvider, Typography, Button, LinearProgress } from "@mui/material";
import { darkTheme } from "./theme";
import { useEffect } from "react";
import { BrowserProvider, useBrowser } from "./contexts/BrowserContext";
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
    <LinearProgress
      sx={{
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
  const { browserInfo } = useBrowser();

  useEffect(() => {
    const setVh = () => {
      document.documentElement.style.setProperty(
        "--vh",
        `${window.innerHeight * 0.01}px`,
      );
    };
    setVh();
    window.addEventListener("resize", setVh);
    return () => window.removeEventListener("resize", setVh);
  }, []);

  return (
    <Box
      sx={{
        minHeight: browserInfo.maxScreenHeight,
        maxHeight: browserInfo.maxScreenHeight,
        overflow: "hidden", // Prevent scrolling
      }}
    >
      <Outlet />
    </Box>
  );
}

export function HydrateFallback() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <PlayerSkeleton />
    </ThemeProvider>
  );
}

export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <Box sx={{ padding: 4, textAlign: 'center', minHeight: '100dvh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Box>
          <Typography variant="h3" gutterBottom>Something went wrong</Typography>
          <Typography variant="body1" sx={{ mt: 2, mb: 3 }}>
            {error instanceof Error ? error.message : 'Unknown error'}
          </Typography>
          <Button variant="contained" onClick={() => window.location.href = '/'}>
            Go Home
          </Button>
        </Box>
      </Box>
    </ThemeProvider>
  );
}

export default function Root() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <NavigationProgress />
      <BrowserProvider>
        <AppContent />
      </BrowserProvider>
    </ThemeProvider>
  );
}


