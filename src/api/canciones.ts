import yaml from "js-yaml";
const API_URL = import.meta.env.VITE_API_ENDPOINT;

export interface AudioFileRecord {
  id: string;
  title: string;
  artist: string;
  filename: string;
  checksum: string;
  tags: string[];
  added_date: string;
  metadata: Record<string, any>;
  url: string;
}

export interface AudioCatalog {
  songs: AudioFileRecord[];
}
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
    const response = await fetch(`${API_URL}/canciones/catalog.yml`);
    const data = await response.text();
    const catalog = yaml.load(data) as AudioCatalog;
    catalog.songs.forEach((song) => {
      song.url = `${API_URL}/canciones/canciones/${song.filename}`;
    });
    return catalog;
  } catch (error) {
    throw new Error("Failed to fetch audio catalog");
  }
};

export const fetchAudioFile = async (filename: string): Promise<Response> => {
  try {
    return fetch(`${API_URL}/canciones/canciones/${filename}`);
  } catch (error) {
    throw new Error("Failed to fetch audio file");
  }
};
