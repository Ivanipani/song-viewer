import { Howl } from "howler";
import { AudioFileRecord, AudioCatalog, AudioState } from "../api/types";

/**
 * Gets the next track index in the catalog
 * @param currentIndex - The current track index
 * @param catalogLength - Total number of tracks in the catalog
 * @returns The next track index, or null if at the end
 */
export function getNextTrackIndex(
  currentIndex: number,
  catalogLength: number
): number | null {
  const nextIndex = currentIndex + 1;
  return nextIndex < catalogLength ? nextIndex : null;
}

/**
 * Gets the previous track index in the catalog
 * @param currentIndex - The current track index
 * @returns The previous track index, or null if at the beginning
 */
export function getPreviousTrackIndex(currentIndex: number): number | null {
  const prevIndex = currentIndex - 1;
  return prevIndex >= 0 ? prevIndex : null;
}

/**
 * Gets a random track from the catalog, excluding the current track
 * @param currentTrack - The currently playing track
 * @param catalog - The audio catalog
 * @returns A random track, or null if catalog is empty
 */
export function getRandomTrack(
  currentTrack: AudioFileRecord | null,
  catalog: AudioCatalog
): AudioFileRecord | null {
  if (catalog.songs.length === 0) return null;
  if (catalog.songs.length === 1) return catalog.songs[0];

  // Get random track that's not the current track
  let randomTrack: AudioFileRecord;
  do {
    const randomIndex = Math.floor(Math.random() * catalog.songs.length);
    randomTrack = catalog.songs[randomIndex];
  } while (currentTrack && randomTrack.id === currentTrack.id);

  return randomTrack;
}

/**
 * Gets the next track from the catalog
 * @param currentTrack - The currently playing track
 * @param catalog - The audio catalog
 * @param shuffle - Whether shuffle mode is enabled
 * @param loop - Loop mode: "none", "single", "all"
 * @returns The next track, or null if at the end (when not looping)
 */
export function getNextTrack(
  currentTrack: AudioFileRecord | null,
  catalog: AudioCatalog,
  shuffle: boolean = false,
  loop: "single" | "all" | "none" = "none",
): AudioFileRecord | null {
  if (!currentTrack) return null;

  // If loop is set to "single", return the same track
  if (loop === "single") {
    return currentTrack;
  }

  // If shuffle is enabled, return a random track
  if (shuffle) {
    return getRandomTrack(currentTrack, catalog);
  }

  // Otherwise, return the next track in order
  const nextIndex = getNextTrackIndex(currentTrack.index, catalog.songs.length);

  // If we're at the end and loop is "all", go back to the first track
  if (nextIndex === null && loop === "all") {
    return catalog.songs[0];
  }

  return nextIndex !== null ? catalog.songs[nextIndex] : null;
}

/**
 * Gets the previous track from the catalog
 * @param currentTrack - The currently playing track
 * @param catalog - The audio catalog
 * @param shuffle - Whether shuffle mode is enabled
 * @param loop - Loop mode: "none", "single", "all"
 * @returns The previous track, or null if at the beginning (when not looping)
 */
export function getPreviousTrack(
  currentTrack: AudioFileRecord | null,
  catalog: AudioCatalog,
  shuffle: boolean = false,
  loop: "single" | "all" | "none" = "none",
): AudioFileRecord | null {
  if (!currentTrack) return null;

  // If loop is set to "single", return the same track
  if (loop === "single") {
    return currentTrack;
  }

  // If shuffle is enabled, return a random track
  if (shuffle) {
    return getRandomTrack(currentTrack, catalog);
  }

  // Otherwise, return the previous track in order
  const prevIndex = getPreviousTrackIndex(currentTrack.index);
  return prevIndex !== null ? catalog.songs[prevIndex] : null;
}

/**
 * Configuration for Howl sound creation callbacks
 */
export interface SoundCallbacks {
  onLoad?: (duration: number) => void;
  onPlay?: () => void;
  onStop?: () => void;
  onEnd?: () => void;
  onPause?: () => void;
  onSeek?: (seek: number) => void;
  onLoadError?: (id: number, error: any) => void;
  onPlayError?: (id: number, error: any) => void;
}

/**
 * Creates a new Howl sound instance with the specified callbacks
 * The Howl constructor makes a GET request to MEDIA_API_URL/<filename> to download the sound file.
 * @param url - The URL of the audio file
 * @param callbacks - Event callbacks for the sound
 * @returns A new Howl instance
 */
export function createSound(url: string, callbacks: SoundCallbacks = {}): Howl {
  const sound = new Howl({
    src: [url],
    autoplay: false,
    preload: true,
    onseek: (seek) => {
      console.log("onseek", seek);
      callbacks.onSeek?.(seek);
    },
    onload: () => {
      console.log("onload");
      callbacks.onLoad?.(sound.duration());
    },
    onloaderror: (id, error) => {
      console.log("onloaderror", id, error);
      callbacks.onLoadError?.(id, error);
    },
    onplayerror: (id, error) => {
      console.log("onplayerror", id, error);
      callbacks.onPlayError?.(id, error);
    },
    onplay: () => {
      console.log("onplay");
      callbacks.onPlay?.();
    },
    onstop: () => {
      console.log("onstop");
      callbacks.onStop?.();
    },
    onend: () => {
      console.log("onend");
      callbacks.onEnd?.();
    },
    onpause: () => {
      console.log("onpause");
      callbacks.onPause?.();
    },
  });
  return sound;
}

/**
 * Cleans up a Howl sound instance
 * @param sound - The Howl instance to clean up
 */
export function cleanupSound(sound: Howl | null): void {
  if (sound) {
    sound.stop();
    sound.unload();
  }
}

/**
 * Creates the initial audio state with the first track from the catalog
 * @param catalog - The audio catalog
 * @param callbacks - Sound callbacks
 * @returns Initial audio state
 */
export function createInitialAudioState(
  catalog: AudioCatalog,
  callbacks: SoundCallbacks = {}
): Partial<AudioState> {
  const firstTrack = catalog.songs[0];
  const sound = createSound(firstTrack.url, callbacks);

  return {
    selectedTrack: firstTrack,
    sound,
    position: 0,
    duration: sound.duration(),
    loop: "none",
    shuffle: false,
  };
}
