import { Box } from "@mantine/core";

interface PhotoViewerProps {
  photos: string[];
  currentPhotoIndex: number;
}

export function PhotoViewer({ photos, currentPhotoIndex }: PhotoViewerProps) {
  return (
    <Box style={{ flex: 1.5, padding: "2.5rem" }}>
      {photos.length > 0 && (
        <img
          src={photos[currentPhotoIndex]}
          alt={`Slide ${currentPhotoIndex}`}
          style={{ height: "100%", width: "100%", objectFit: "cover" }}
        />
      )}
    </Box>
  );
}
