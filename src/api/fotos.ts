import { FOTOS_API_URL } from "./constants";
export const fetchPhotos = async (): Promise<string[]> => {
  const response = await fetch(`${FOTOS_API_URL}/`);
  const data = await response.json();
  console.log(data);
  return data.map((photo: any) => `${FOTOS_API_URL}/${photo.name}`);
};
