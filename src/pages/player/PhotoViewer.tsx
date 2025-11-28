import { Box } from "@mui/material";

interface PhotoViewerProps {
  photos: string[];
  currentPhotoIndex: number;
}

export function PhotoViewer({ photos, currentPhotoIndex }: PhotoViewerProps) {
  return (
    <Box sx={{ flex: 1.5, padding: 10 }}>
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
