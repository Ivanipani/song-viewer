"""Audio processing utilities for converting and analyzing audio files.

This module provides wrappers around FFmpeg and audiowaveform for:
- Converting WAV files to MP3 and OGG formats
- Generating waveform peak data for visualization
"""

from pathlib import Path
import subprocess
from typing import Optional, Tuple
import shutil


class AudioProcessingError(Exception):
    """Raised when audio processing fails."""
    pass


class AudioProcessor:
    """Handles audio file conversion and waveform generation."""

    def __init__(self):
        """Initialize the audio processor and check for required tools."""
        self._check_dependencies()

    def _check_dependencies(self):
        """Check if required tools (ffmpeg, audiowaveform) are installed."""
        if not shutil.which("ffmpeg"):
            raise AudioProcessingError(
                "ffmpeg not found. Please install: brew install ffmpeg"
            )

        if not shutil.which("audiowaveform"):
            raise AudioProcessingError(
                "audiowaveform not found. Please install: brew install audiowaveform"
            )

    def convert_to_mp3(
        self,
        input_file: Path,
        output_file: Path,
        bitrate: int = 128,
        sample_rate: int = 44100
    ) -> bool:
        """Convert audio file to MP3 format.

        Args:
            input_file: Path to input audio file
            output_file: Path to output MP3 file
            bitrate: Target bitrate in kbps (default: 128)
            sample_rate: Target sample rate in Hz (default: 44100)

        Returns:
            True if conversion succeeded

        Raises:
            AudioProcessingError: If conversion fails
        """
        cmd = [
            "ffmpeg",
            "-i", str(input_file),
            "-codec:a", "libmp3lame",
            "-b:a", f"{bitrate}k",
            "-ar", str(sample_rate),
            "-y",  # Overwrite output file
            str(output_file)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            raise AudioProcessingError(
                f"Failed to convert {input_file} to MP3: {e.stderr}"
            )

    def convert_to_ogg(
        self,
        input_file: Path,
        output_file: Path,
        quality: int = 4,
        sample_rate: int = 44100
    ) -> bool:
        """Convert audio file to OGG/Vorbis format.

        Args:
            input_file: Path to input audio file
            output_file: Path to output OGG file
            quality: Vorbis quality level 0-10 (default: 4, ~128kbps)
            sample_rate: Target sample rate in Hz (default: 44100)

        Returns:
            True if conversion succeeded

        Raises:
            AudioProcessingError: If conversion fails
        """
        cmd = [
            "ffmpeg",
            "-i", str(input_file),
            "-codec:a", "libvorbis",
            "-q:a", str(quality),
            "-ar", str(sample_rate),
            "-y",  # Overwrite output file
            str(output_file)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            raise AudioProcessingError(
                f"Failed to convert {input_file} to OGG: {e.stderr}"
            )

    def generate_peaks(
        self,
        input_file: Path,
        output_file: Path,
        pixels_per_second: int = 20,
        bits: int = 8
    ) -> bool:
        """Generate waveform peak data for visualization.

        Args:
            input_file: Path to input audio file
            output_file: Path to output JSON peaks file
            pixels_per_second: Zoom level for waveform (default: 20)
            bits: Bit depth for peak data (default: 8)

        Returns:
            True if peak generation succeeded

        Raises:
            AudioProcessingError: If peak generation fails
        """
        cmd = [
            "audiowaveform",
            "-i", str(input_file),
            "-o", str(output_file),
            "--pixels-per-second", str(pixels_per_second),
            "--bits", str(bits)
        ]

        try:
            result = subprocess.run(
                cmd,
                capture_output=True,
                text=True,
                check=True
            )
            return True
        except subprocess.CalledProcessError as e:
            raise AudioProcessingError(
                f"Failed to generate peaks for {input_file}: {e.stderr}"
            )

    def process_track(
        self,
        input_file: Path,
        output_dir: Path,
        track_id: str,
        bitrate: int = 128,
        ogg_quality: int = 4
    ) -> Tuple[Path, Path, Path]:
        """Process a single track: convert to web formats and generate peaks.

        Args:
            input_file: Path to input WAV file
            output_dir: Directory to save output files
            track_id: ID for naming output files
            bitrate: MP3 bitrate in kbps (default: 128)
            ogg_quality: OGG quality level (default: 4)

        Returns:
            Tuple of (mp3_path, ogg_path, peaks_path)

        Raises:
            AudioProcessingError: If any processing step fails
        """
        if not input_file.exists():
            raise AudioProcessingError(f"Input file not found: {input_file}")

        # Create output directory if it doesn't exist
        output_dir.mkdir(parents=True, exist_ok=True)

        # Define output file paths
        mp3_path = output_dir / f"{track_id}.mp3"
        ogg_path = output_dir / f"{track_id}.ogg"
        peaks_path = output_dir / f"{track_id}.json"

        # Convert to MP3
        print(f"  Converting to MP3 ({bitrate}kbps)...")
        self.convert_to_mp3(input_file, mp3_path, bitrate=bitrate)

        # Convert to OGG
        print(f"  Converting to OGG (quality {ogg_quality})...")
        self.convert_to_ogg(input_file, ogg_path, quality=ogg_quality)

        # Generate peaks
        print(f"  Generating waveform peaks...")
        self.generate_peaks(input_file, peaks_path)

        return mp3_path, ogg_path, peaks_path

    def get_file_size_mb(self, file_path: Path) -> float:
        """Get file size in megabytes.

        Args:
            file_path: Path to file

        Returns:
            File size in MB
        """
        if not file_path.exists():
            return 0.0
        return file_path.stat().st_size / (1024 * 1024)


if __name__ == "__main__":
    # Test the audio processor
    import sys

    if len(sys.argv) < 3:
        print("Usage: python audio_processor.py <input.wav> <output_dir>")
        sys.exit(1)

    input_path = Path(sys.argv[1])
    output_dir = Path(sys.argv[2])

    processor = AudioProcessor()

    print(f"\nProcessing: {input_path.name}")
    print(f"Output directory: {output_dir}")
    print()

    try:
        mp3, ogg, peaks = processor.process_track(
            input_path,
            output_dir,
            track_id="test-track"
        )

        print("\n✓ Processing complete!")
        print(f"  MP3:   {mp3.name} ({processor.get_file_size_mb(mp3):.2f} MB)")
        print(f"  OGG:   {ogg.name} ({processor.get_file_size_mb(ogg):.2f} MB)")
        print(f"  Peaks: {peaks.name} ({processor.get_file_size_mb(peaks):.2f} MB)")

    except AudioProcessingError as e:
        print(f"\n✗ Error: {e}", file=sys.stderr)
        sys.exit(1)
