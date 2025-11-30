import yaml from "js-yaml";
import { AudioCatalog, ExtendedMetadata, TrackNotes } from "./types";
import { MEDIA_API_URL, TRACKS_API_URL, FOTOS_API_URL } from "./constants";

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
        const response = await fetch(`${TRACKS_API_URL}/catalog.yml`);
        if (!response.ok) {
            throw new Error("Failed to fetch song catalog")
        }
        const data = await response.text();
        const catalog = yaml.load(data) as AudioCatalog;
        catalog.songs.forEach((song, idx) => {
            song.url = `${MEDIA_API_URL}/${song.filename}`;
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

/**
 * Fetches markdown notes for a specific track
 *
 * @param trackId - The unique track identifier
 * @returns Promise resolving to TrackNotes with markdown content, or null if not found
 *
 * @example
 * const notes = await fetchTrackNotes('ivan-perdomo-busqueda');
 * if (notes) {
 *   console.log(notes.content);
 * }
 */
export const fetchTrackNotes = async (trackId: string): Promise<TrackNotes | null> => {
    try {
        const response = await fetch(
          `${TRACKS_API_URL}/tracks/${trackId}/notes.md`,
        );
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch notes: ${response.status}`);
        }
        const content = await response.text();
        return { content };
    } catch (error) {
        console.error(`Error fetching notes for track ${trackId}:`, error);
        return null;
    }
};

/**
 * Fetches extended metadata for a specific track
 *
 * @param trackId - The unique track identifier
 * @returns Promise resolving to ExtendedMetadata object, or null if not found
 *
 * @example
 * const metadata = await fetchTrackMetadata('ivan-perdomo-busqueda');
 * if (metadata?.theory?.key) {
 *   console.log(`Key: ${metadata.theory.key}`);
 * }
 */
export const fetchTrackMetadata = async (trackId: string): Promise<ExtendedMetadata | null> => {
    try {
        const response = await fetch(
          `${TRACKS_API_URL}/tracks/${trackId}/metadata.yml`,
        );
        if (!response.ok) {
            if (response.status === 404) {
                return null;
            }
            throw new Error(`Failed to fetch metadata: ${response.status}`);
        }
        const text = await response.text();
        const metadata = yaml.load(text) as ExtendedMetadata;
        return metadata;
    } catch (error) {
        console.warn(`Error fetching metadata for track ${trackId}:`, error);
        return null;
    }
};
