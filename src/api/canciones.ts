const API_URL = import.meta.env.VITE_API_ENDPOINT;

export interface AudioFileRecord {
  name: string;
  url: string;
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
export const fetchSongs = async (): Promise<AudioFileRecord[]> => {
  try {
    const response = await fetch(`${API_URL}/canciones/`);
    const data = await response.json();
    console.log(data);
    return Object.values(data).map((indexEntry: any) => ({
      name: indexEntry.name,
      url: `${API_URL}/canciones/${indexEntry.name}`,
    }));
  } catch (error) {
    throw new Error("Failed to fetch songs");
  }
};
