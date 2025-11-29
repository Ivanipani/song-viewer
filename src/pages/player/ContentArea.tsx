import { Box } from "@mantine/core";
import { PhotoViewer } from "./PhotoViewer";

export async function clientLoader() {
  return {};
}

export default function ContentArea(showSlideshow: boolean, photos: string[]) {
  if (true) {
    return <PhotoViewer photos={photos} currentPhotoIndex={1} />;
  }
  return (
    <Box
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        height: "100%",
        padding: "2rem",
      }}
    >
      {/* <Text size="lg" c="dimmed"> */}
      {/*   Enable slideshow to view photos */}
      {/* </Text> */}
    </Box>
  );
}
