import { Links, Meta, Outlet, Scripts, ScrollRestoration } from "react-router";
import { CssBaseline, Box, ThemeProvider } from "@mui/material";
import { darkTheme } from "./theme";
import { useEffect } from "react";
import { MediaProvider } from "./contexts/MediaContext";
import { BrowserProvider, useBrowser } from "./contexts/BrowserContext";
import { CacheProvider } from "@emotion/react";
import createCache from "@emotion/cache";

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
    <MediaProvider>
      <Box
        sx={{
          minHeight: browserInfo.maxScreenHeight,
          maxHeight: browserInfo.maxScreenHeight,
          overflow: "hidden", // Prevent scrolling
        }}
      >
        <Outlet />
      </Box>
    </MediaProvider>
  );
}

export default function Root() {
  return (
    <ThemeProvider theme={darkTheme}>
      <CssBaseline />
      <BrowserProvider>
        <AppContent />
      </BrowserProvider>
    </ThemeProvider>
  );
}


