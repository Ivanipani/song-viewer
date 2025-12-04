/**
 * Root component hierarchy and data flow:
 *
 * HydratedRouter (from entry.client.tsx)
 *   └─ Root
 *       ├─ MantineProvider (wraps entire app with Mantine UI theme)
 *       ├─ NavigationProgress (shows loading bar during route transitions)
 *       └─ AppContent (renders child routes via Outlet)
 *
 * Alternative components used during special states:
 *   - Layout: HTML document structure wrapper
 *   - HydrateFallback: Shown during initial app hydration
 *   - ErrorBoundary: Shown when route errors occur
 *
 * Data ownership: None - this is a presentation wrapper
 * Network calls: None - data fetching happens in route loaders
 */
import { Links, Meta, Outlet, Scripts, ScrollRestoration, useRouteError, useNavigation } from "react-router";
import { MantineProvider, Box, Title, Text, Button, Progress, localStorageColorSchemeManager } from "@mantine/core";
import { theme } from "./theme";
import { PlayerSkeleton } from "./pages/player/PlayerSkeleton";

/**
 * HTML document layout wrapper component.
 *
 * Provides the basic HTML structure including head and body tags.
 * Used by React Router to wrap all route content.
 *
 * @param children - The route content to render within the body
 */
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

/**
 * Navigation progress indicator component.
 *
 * Displays an animated progress bar at the top of the screen during route navigation.
 * Automatically shows/hides based on React Router's navigation state.
 *
 * Data sources: useNavigation hook (navigation.state from React Router)
 */
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

/**
 * Main application content wrapper component.
 *
 * Provides a full-height container for route content and renders child routes via Outlet.
 * Sets up viewport constraints for the player interface.
 *
 * Child routes: Renders content from routes.ts via Outlet
 */
function AppContent() {
  return (
    <Box
      style={{
        height: '100dvh',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Outlet />
    </Box>
  );
}

/**
 * Hydration fallback component.
 *
 * Displayed during the initial app hydration phase before the main app loads.
 * Shows a skeleton loader to provide instant visual feedback.
 *
 * Uses: PlayerSkeleton component for loading state
 */
export function HydrateFallback() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      colorSchemeManager={localStorageColorSchemeManager({ key: 'mantine-color-scheme' })}
    >
      <PlayerSkeleton />
    </MantineProvider>
  );
}

/**
 * Root-level error boundary component.
 *
 * Catches and displays errors that occur during routing.
 * Provides a user-friendly error message and navigation option to return home.
 *
 * Data sources: useRouteError hook (error details from React Router)
 */
export function ErrorBoundary() {
  const error = useRouteError();

  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      colorSchemeManager={localStorageColorSchemeManager({ key: 'mantine-color-scheme' })}
    >
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

/**
 * Root application component.
 *
 * Top-level component that wraps the entire application with:
 * - MantineProvider for UI theming (dark mode by default)
 * - NavigationProgress for route transition feedback
 * - AppContent which renders child routes
 *
 * This is the default export rendered by the router at the root level.
 * All route content is rendered as children via the Outlet in AppContent.
 */
export default function Root() {
  return (
    <MantineProvider
      theme={theme}
      defaultColorScheme="dark"
      colorSchemeManager={localStorageColorSchemeManager({ key: 'mantine-color-scheme' })}
    >
      <NavigationProgress />
      <AppContent />
    </MantineProvider>
  );
}


