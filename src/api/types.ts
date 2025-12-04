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

export interface TrackPerformance {
    date?: string;
    location?: string;
    mood?: string;
    take_number?: number;
    improvised?: boolean;
}

export interface TrackRecording {
    microphone?: string;
    interface?: string;
    daw?: string;
    effects?: Record<string, string>[];
    sample_rate?: number;
    bit_depth?: number;
}

export interface ChordProgressionEntry {
    measure: number;
    chord: string;
}

export interface TrackTheory {
    key?: string;
    time_signature?: string;
    tempo_bpm?: number;
    chord_progression?: ChordProgressionEntry[];
    scale?: string;
    techniques?: string[];
}

export interface TrackLyrics {
    language?: string;
    content?: string;
}

export interface AudioFileVariant {
    url: string;
    format: 'mp3' | 'ogg';
}

export interface TrackStem {
    id: string;
    name: string;
    color: string;
    order: number;
    audio_files: AudioFileVariant[];
    peaks_url: string;
    muted: boolean;
    solo: boolean;
    source_files?: string[];
}

export interface MixingProject {
    project_path: string;
    project_file: string;
    last_processed: string;
    tracks: TrackStem[];
}

export interface WaveformPeaks {
    version: number;
    channels: number;
    sample_rate: number;
    samples_per_pixel: number;
    bits: number;
    length: number;
    data: number[];
}

export interface ExtendedMetadata {
    performance?: TrackPerformance;
    recording?: TrackRecording;
    theory?: TrackTheory;
    lyrics?: TrackLyrics;
    tags?: string[];
    inspiration?: string;
    related_tracks?: string[];
    mixing?: MixingProject;
}

export interface TrackNotes {
    content: string;
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
