import { PhotoViewer } from "./PhotoViewer";

export async function clientLoader() {
  return {};
}

export default function ContentArea() {
  const photos: string[] = [];
  return <PhotoViewer photos={photos} currentPhotoIndex={1} />;
}
