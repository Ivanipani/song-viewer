import { type RouteConfig, route, index } from "@react-router/dev/routes";

export default [
  route("/", "./pages/player/layout.tsx", [
    // Empty state - no track selected
    index("./pages/player/index.tsx"),

    // Track view with nested views (notes, chords, tracks)
    route("track/:trackId", "./pages/player/track/layout.tsx", [
      index("./pages/player/track/notes.tsx"),      // Default: /track/:trackId redirects to notes
      route("chords", "./pages/player/track/chords.tsx"), // /track/:trackId/chords
      route("tracks", "./pages/player/track/tracks.tsx"), // /track/:trackId/tracks
    ]),
  ]),
] satisfies RouteConfig;
