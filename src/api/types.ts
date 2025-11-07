export interface AudioCatalog {
  songs: AudioFileRecord[];
}

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
  index: number;
}

export interface AudioState {
  isPlaying: boolean;
  selectedTrack: AudioFileRecord | null;
  sound: Howl | null;
  position: number;
  duration: number;
  loop: "single" | "all" | "none";
  shuffle: boolean;
}
