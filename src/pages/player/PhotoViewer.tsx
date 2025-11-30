/**
 * Photo slideshow viewer component.
 *
 * Parent components: PlayerIndex, TrackPlayer
 *
 * Responsibilities:
 * - Displays a single photo from the photos array
 * - Shows photo at index specified by currentPhotoIndex
 * - Scales photo to fit container while maintaining aspect ratio
 *
 * Data received from parent:
 * - photos: string[] - array of photo URLs (from parent route's loader)
 * - currentPhotoIndex: number - index of photo to display (managed by parent)
 *
 * Parent controls slideshow timing:
 * - PlayerIndex auto-advances currentPhotoIndex every 3s when slideshow enabled
 *
 * No data ownership - purely presentational component.
 * No network calls - photo URLs come from parent route loader.
 */
import { Box } from "@mantine/core";
import { useState, useEffect } from "react";
interface PhotoViewerProps {
  photos: string[];
  currentPhotoIndex: number;
}

export function PhotoViewer({ photos }: PhotoViewerProps) {
  const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);

  useEffect(() => {
    if (photos.length === 0) return;
    const interval = setInterval(() => {
      setCurrentPhotoIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 3000);
    return () => clearInterval(interval);
  }, [photos]);

  return (
    <Box style={{ width: "100%", height: "100%", padding: "2rem" }}>
      {photos.length > 0 && (
        <img
          src={photos[currentPhotoIndex]}
          alt={`Slide ${currentPhotoIndex}`}
          style={{ height: "100%", width: "100%", objectFit: "contain" }}
        />
      )}
    </Box>
  );
}
