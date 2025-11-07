import yaml from "js-yaml";
import { AudioFileRecord } from "./types";
import { CANCIONES_API_URL, FOTOS_API_URL } from "./constants";

/**
 * Fetches a list of songs from the API endpoint
 *
 * @returns {Promise<{ name: string }[]>} A promise that resolves to an array of song objects
 * @throws {Error} If the network request fails
 *
 * @example
 * const songs = await fetchSongs();
 * // returns: [{ name: "song1.mp3" }, { name: "song2.mp3" }]
 */
export const fetchAudioCatalog = async (): Promise<AudioCatalog> => {
  try {
    const response = await fetch(`${CANCIONES_API_URL}/catalog.yml`);
    const data = await response.text();
    const catalog = yaml.load(data) as AudioCatalog;
    catalog.songs.forEach((song, idx) => {
      song.url = `${CANCIONES_API_URL}/${song.filename}`;
      song.index = idx;
    });
    return catalog;
  } catch (error) {
    console.error(error);
    return { songs: [] };
    // throw new Error("Failed to fetch audio catalog");
  }
};

export const fetchPhotos = async (): Promise<string[]> => {
  const response = await fetch(`${FOTOS_API_URL}/`);
  const data = await response.json();
  console.log(data);
  return data.map((photo: any) => `${FOTOS_API_URL}/${photo.name}`);
};
