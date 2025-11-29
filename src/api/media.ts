import yaml from "js-yaml";
import { AudioCatalog } from "./types";
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
        if (!response.ok) {
            throw new Error("Failed to fetch song catalog")
        }
        const data = await response.text();
        const catalog = yaml.load(data) as AudioCatalog;
        catalog.songs.forEach((song, idx) => {
            song.url = `${CANCIONES_API_URL}/${song.filename}`;
            song.index = idx;
        });
        return catalog;
    } catch (error) {
        console.error(error);
        throw new Error("Failed to fetch audio catalog");
    }
};

export const fetchPhotos = async (): Promise<string[]> => {
    try {
        const response = await fetch(`${FOTOS_API_URL}/`);
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        const data = await response.json();
        return data.map((photo: any) => `${FOTOS_API_URL}/${photo.name}`);
    } catch (error) {
        console.error('Failed to fetch photos:', error);
        throw new Error('Failed to fetch photos');
    }
};
