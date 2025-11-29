/**
 * Main player page component.
 *
 * React Router route: "/" index route (configured in routes.ts)
 *
 * Component hierarchy:
 * PlayerIndex
 *   ├─ AppShell (Mantine layout)
 *   │   ├─ AppShell.Header (mobile only - burger menu)
 *   │   ├─ AppShell.Navbar
 *   │   │   ├─ Track (multiple - one per song in catalog)
 *   │   │   └─ PlayControl (player controls in sidebar)
 *   │   ├─ AppShell.Main
 *   │   │   └─ PhotoViewer (when slideshow=true in URL)
 *   │   └─ AppShell.Footer (GitHub link)
 *
 * Data ownership:
 * - catalog: AudioCatalog - received from parent route (PlayerLayout) via useMatches
 * - photos: string[] - received from parent route (PlayerLayout) via useMatches
 * - audioState: AudioState - owned by useAudioPlayer hook
 *   Contains: selectedTrack, sound (Howl instance), isPlaying, position, duration, loop, shuffle
 * - currentPhotoIndex: number - local state for slideshow
 * - opened: boolean - local state for mobile navbar
 *
 * Data sources:
 * - Parent route data: catalog and photos fetched by PlayerLayout's clientLoader
 * - URL query params: ?track=<id>&slideshow=true
 * - useAudioPlayer: Manages all audio playback state and URL sync
 *
 * No direct network calls - data comes from parent route loader.
 */
import { useState, useEffect } from "react";
import { useSearchParams, useMatches } from "react-router";
import { AudioCatalog, AudioFileRecord } from "../../api/types";
import {
  AppShell,
  Box,
  Anchor,
  ScrollArea,
  Burger,
  Text,
  Group,
} from "@mantine/core";

export default function PlayerIndex() {
  const matches = useMatches();
  console.log("matches", matches);
  // Find parent route data - check all matches for data
  const parentMatch = matches.find(
    (match) =>
      match.data && typeof match.data === "object" && "catalog" in match.data,
  );
  const parentData = parentMatch?.data as
    | { catalog: AudioCatalog; photos: string[] }
    | undefined;

  const catalog = parentData?.catalog;
  const photos = parentData?.photos || [];

  return <></>;
}
