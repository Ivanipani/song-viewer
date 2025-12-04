"""Parser for REAPER project (.RPP) files.

This module extracts track information from REAPER project files including
track names, colors, and associated audio files.
"""

from pathlib import Path
from typing import List, Dict, Any, Optional
import re


class Track:
    """Represents a track from a REAPER project."""

    def __init__(self, guid: str, name: str, color_bgr: int):
        self.guid = guid
        self.name = name
        self.color_bgr = color_bgr
        self.audio_files: List[str] = []

    @property
    def color_hex(self) -> str:
        """Convert BGR integer to hex RGB color for CSS."""
        # REAPER stores colors as BGR (Blue-Green-Red) integers
        # We need to convert to RGB hex format (#RRGGBB)
        blue = (self.color_bgr >> 16) & 0xFF
        green = (self.color_bgr >> 8) & 0xFF
        red = self.color_bgr & 0xFF
        return f"#{red:02x}{green:02x}{blue:02x}"

    def has_audio(self) -> bool:
        """Check if track has any audio files."""
        return len(self.audio_files) > 0

    def __repr__(self) -> str:
        return f"Track(name='{self.name}', color='{self.color_hex}', files={len(self.audio_files)})"


class ReaperParser:
    """Parser for REAPER project files."""

    # Tracks to exclude (utility tracks, not music content)
    EXCLUDED_TRACK_NAMES = {
        "Click + MIDI Control",
        "Computer Audio",
        "Click source"
    }

    def __init__(self, project_file: Path):
        """Initialize parser with path to .RPP file.

        Args:
            project_file: Path to the REAPER project file
        """
        self.project_file = project_file
        self.tracks: List[Track] = []

    def parse(self) -> List[Track]:
        """Parse the REAPER project file and extract track information.

        Returns:
            List of Track objects with audio files
        """
        with open(self.project_file, 'r', encoding='utf-8', errors='ignore') as f:
            lines = f.readlines()

        self.tracks = []
        current_track: Optional[Track] = None
        in_track = False
        in_item = False
        indent_stack: List[int] = []

        for line_num, line in enumerate(lines, 1):
            # Calculate indentation level
            indent = len(line) - len(line.lstrip())

            # Track block management
            if '<TRACK' in line and line.strip().startswith('<TRACK'):
                # Extract GUID
                guid_match = re.search(r'\{([^}]+)\}', line)
                guid = guid_match.group(1) if guid_match else f"unknown-{line_num}"
                current_track = Track(guid=guid, name="", color_bgr=0)
                in_track = True
                track_indent = indent
                continue

            if in_track and current_track:
                # Check if we've exited the track block
                if line.strip() == '>' and indent <= track_indent:
                    # Only add track if it has audio and isn't excluded
                    if current_track.has_audio() and current_track.name not in self.EXCLUDED_TRACK_NAMES:
                        self.tracks.append(current_track)
                    current_track = None
                    in_track = False
                    continue

                # Parse track name
                if line.strip().startswith('NAME '):
                    name_match = re.search(r'NAME\s+"([^"]+)"', line)
                    if name_match and current_track:
                        current_track.name = name_match.group(1)

                # Parse track color (PEAKCOL is BGR integer)
                elif line.strip().startswith('PEAKCOL '):
                    color_match = re.search(r'PEAKCOL\s+(\d+)', line)
                    if color_match and current_track:
                        current_track.color_bgr = int(color_match.group(1))

                # Detect ITEM blocks
                elif line.strip().startswith('<ITEM'):
                    in_item = True
                    item_indent = indent

                # Parse audio file from SOURCE WAVE
                elif in_item and '<SOURCE WAVE' in line:
                    # Next line should have the FILE path
                    # Note: line_num is 1-indexed (from enumerate starting at 1)
                    # lines is 0-indexed, so lines[line_num] points to the next line
                    next_line_index = line_num  # Points to next line due to 1-indexing

                    if next_line_index < len(lines):  # Bounds check
                        next_line = lines[next_line_index]
                        file_match = re.search(r'FILE\s+"([^"]+)"', next_line)
                        if file_match and current_track:
                            file_path = file_match.group(1)
                            # Only add unique files
                            if file_path not in current_track.audio_files:
                                current_track.audio_files.append(file_path)

                # Exit ITEM block
                elif in_item and line.strip() == '>' and indent <= item_indent:
                    in_item = False

        return self.tracks

    def get_audio_tracks(self) -> List[Track]:
        """Get all tracks that have audio files.

        Returns:
            List of Track objects that contain audio files
        """
        return [track for track in self.tracks if track.has_audio()]

    def print_summary(self):
        """Print a summary of parsed tracks."""
        print(f"Parsed {len(self.tracks)} tracks from {self.project_file.name}")
        print()
        for i, track in enumerate(self.tracks, 1):
            print(f"{i}. {track.name}")
            print(f"   Color: {track.color_hex}")
            print(f"   Audio files: {len(track.audio_files)}")
            for audio_file in track.audio_files:
                print(f"     - {audio_file}")
            print()


def parse_reaper_project(project_file: Path) -> List[Track]:
    """Convenience function to parse a REAPER project file.

    Args:
        project_file: Path to the .RPP file

    Returns:
        List of Track objects with audio files
    """
    parser = ReaperParser(project_file)
    return parser.parse()


if __name__ == "__main__":
    # Test the parser with the Diciembre 29 en casa project
    import sys

    if len(sys.argv) > 1:
        project_path = Path(sys.argv[1])
    else:
        # Default test file
        project_path = Path("/Users/ivanperdomo/Music/mixing-backup-20251201/Diciembre 29 en casa/Diciembre 29 en casa.RPP")

    if not project_path.exists():
        print(f"Error: Project file not found: {project_path}")
        sys.exit(1)

    parser = ReaperParser(project_path)
    tracks = parser.parse()
    parser.print_summary()
