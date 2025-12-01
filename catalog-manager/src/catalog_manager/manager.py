#!/usr/bin/env python3
import click
import yaml
import hashlib
import re
from pathlib import Path
from datetime import datetime
import os
import subprocess
from typing import Optional, List, Dict, Any
from pydantic import BaseModel, Field

from .reaper_parser import ReaperParser
from .audio_processor import AudioProcessor, AudioProcessingError
from .utils import (
    validate_song_exists, get_song_by_id, get_song_directory,
    select_song_with_search, ValidationError, PathResolutionError,
    safe_list_selection, load_yaml_safe, validate_directory_exists
)

# Default mixing directory (uses user's home directory)
DEFAULT_MIXING_DIR = os.path.expanduser("~/Music/mixing")


def sanitize_string(s: str) -> str:
    """Sanitize string for use in IDs (alphanumeric and hyphens only)."""
    # Lowercase and replace spaces with hyphens
    s = s.lower().replace(" ", "-")
    # Remove all non-alphanumeric except hyphens
    s = re.sub(r'[^a-z0-9-]', '', s)
    # Collapse multiple hyphens
    s = re.sub(r'-+', '-', s)
    # Strip leading/trailing hyphens
    return s.strip('-')


def generate_id_hash(title: str, artist: str, filename: str) -> str:
    """Generate 4-char hash for ID uniqueness."""
    combined = f"{title}|{artist}|{filename}"
    return hashlib.sha256(combined.encode()).hexdigest()[:4]


class Song(BaseModel):
    id: str
    title: str
    artist: str
    filename: str = Field(default="master.mp3")
    checksum: str = Field(default="")
    tags: List[str] = Field(default_factory=list)
    added_date: str = Field(default_factory=lambda: datetime.now().isoformat())
    metadata: dict = Field(default_factory=dict)

    def __str__(self) -> str:
        separator = "-" * 80
        return f"""{separator}
ID: {self.id}
Title: {self.title}
Artist: {self.artist}
Filename: {self.filename}
Checksum: {self.checksum}
Tags: {', '.join(self.tags)}
Metadata: {self.metadata}
"""

    @classmethod
    def create(
        cls,
        title: str,
        artist: str,
        filename: str,
        checksum: str,
        tags: List[str],
        metadata: Optional[dict] = None,
    ) -> "Song":
        """Factory method to create a new Song instance."""
        sanitized_title = sanitize_string(title)
        id_hash = generate_id_hash(title, artist, filename)
        song_id = f"{sanitized_title}-{id_hash}"

        return cls(
            id=song_id,
            title=title,
            artist=artist,
            filename=filename,
            checksum=checksum,
            tags=tags,
            metadata=metadata or {},
        )

    class Config:
        json_encoders = {Path: str}


class Catalog(BaseModel):
    """Catalog of songs."""

    songs: List[Song] = Field(default_factory=list)


class CatalogManager:
    def __init__(self, catalog_path: Path):
        self.catalog_path = catalog_path
        self.catalog = self._load()

    def _load(self) -> Catalog:
        """Load the catalog file, create if it doesn't exist."""
        if not self.catalog_path.exists():
            return Catalog(songs=[])

        try:
            catalog_data = load_yaml_safe(self.catalog_path, expected_keys=["songs"])

            # Validate songs is a list
            if not isinstance(catalog_data.get("songs"), list):
                raise ValidationError("'songs' must be a list in catalog file")

            # Convert dicts to Song models with validation
            songs = []
            for i, song_data in enumerate(catalog_data["songs"]):
                try:
                    songs.append(Song(**song_data))
                except Exception as e:
                    raise ValidationError(f"Invalid song at index {i} in catalog: {e}")

            return Catalog(songs=songs)
        except ValidationError as e:
            # Convert to Click exception for proper CLI error handling
            raise click.ClickException(f"Failed to load catalog from {self.catalog_path}: {e}")

    @property
    def songs(self) -> List[Song]:
        return self.catalog.songs

    def save(self):
        with open(self.catalog_path, "w") as f:
            yaml.dump(self.catalog.model_dump(), f, sort_keys=False, allow_unicode=True)

    def contains(self, song_id: str) -> bool:
        return any(song.id == song_id for song in self.catalog.songs)

    def add_song(self, song: Song):
        self.catalog.songs.append(song)


def generate_file_hash(file_path: str, chunk_size: int = 8192) -> str:
    """Generate SHA-256 hash of a file."""
    sha256_hash = hashlib.sha256()

    with open(file_path, "rb") as f:
        for chunk in iter(lambda: f.read(chunk_size), b""):
            sha256_hash.update(chunk)

    return sha256_hash.hexdigest()


@click.group()
@click.option(
    "--catalog",
    "-c",
    type=click.Path(path_type=Path),
    default="catalog/catalog.yml",
    help="Path to catalog file",
)
@click.pass_context
def cli(ctx, catalog):
    """Manage your song catalog."""
    ctx.ensure_object(dict)
    ctx.obj["catalog_path"] = catalog
    ctx.obj["catalog_manager"] = CatalogManager(catalog)


@cli.command()
@click.argument("song_path", type=click.Path(exists=True, path_type=Path))
@click.pass_context
def add(ctx, song_path: Path):
    """Add a song to the catalog."""
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive prompts for song information
    title = click.prompt("Song title")
    artist = click.prompt("Artist name")

    # Optional tags with confirmation
    tags = []
    while click.confirm("Add a tag?", default=False):
        tag = click.prompt("Enter tag")
        tags.append(tag)

    # Add metadata collection
    metadata = {}
    while click.confirm("Add metadata field?", default=False):
        key = click.prompt("Enter metadata key")
        value = click.prompt("Enter metadata value")
        metadata[key] = value

    # Create new song instance
    new_song = Song.create(
        title=title,
        artist=artist,
        filename=song_path.name,
        checksum=generate_file_hash(song_path),
        tags=tags,
        metadata=metadata,
    )

    # Check if song already exists
    if catalog_manager.contains(new_song.id):
        raise click.BadParameter(f"Song with ID {new_song.id} already exists")

    # Show summary and confirm
    click.echo("\nSong details:")
    click.echo(new_song)

    if click.confirm("Add this song to catalog?", default=True):
        # Convert model to dict for YAML storage
        catalog_manager.add_song(new_song)
        catalog_manager.save()
        click.echo(f"Added song: {new_song.title} by {new_song.artist}")
    else:
        click.echo("Cancelled adding song")


@cli.command()
@click.pass_context
def show(ctx):
    """List all songs in the catalog."""
    catalog_manager = ctx.obj["catalog_manager"]

    if not catalog_manager.songs:
        click.echo("Catalog is empty")
        return

    # Now we can simply print each song
    for song in catalog_manager.songs:
        click.echo(str(song))


@cli.command()
@click.pass_context
def verify(ctx):
    """Verify all file hashes in the catalog."""
    catalog_manager = ctx.obj["catalog_manager"]
    all_valid = True

    for song in catalog_manager.catalog.songs:
        path = Path(song.filename)
        if not path.exists():
            click.echo(f"Error: File not found: {path}", err=True)
            all_valid = False
            continue

        current_hash = generate_file_hash(path)
        if current_hash != song.checksum:
            click.echo(f"Hash mismatch for {song.id}:")
            click.echo(f"  Stored:  {song.checksum}")
            click.echo(f"  Current: {current_hash}")
            all_valid = False

    if all_valid:
        click.echo("All files verified successfully!")
    else:
        ctx.exit(1)


@cli.command()
@click.argument("song_id", required=False)
@click.pass_context
def edit_notes(ctx, song_id: Optional[str]):
    """Edit markdown notes for a song.

    If SONG_ID is not provided, you will be prompted to select interactively.
    """
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive selection if song_id not provided
    if not song_id:
        try:
            song_id = select_song_with_search(catalog_manager)
        except (ValidationError, click.Abort) as e:
            raise click.ClickException(str(e))

    # Verify song exists
    try:
        validate_song_exists(catalog_manager, song_id)
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Get song directory using utility function
    try:
        song_dir = get_song_directory(ctx.obj["catalog_path"], song_id, create=True)
    except PathResolutionError as e:
        raise click.ClickException(str(e))

    # Create or open notes file
    notes_file = song_dir / "notes.md"
    if not notes_file.exists():
        # Create template
        try:
            song = get_song_by_id(catalog_manager, song_id)
        except ValidationError as e:
            raise click.ClickException(str(e))
        notes_file.write_text(f"""# {song.title}

## Overview
Add your overview here...

## Performance Notes
Add performance notes here...

## Inspiration
What inspired this piece?
""")

    # Open in default editor
    editor = os.environ.get("EDITOR", "vim")
    subprocess.run([editor, str(notes_file)])

    click.echo(f"Notes updated for {song_id}")


@cli.command()
@click.argument("song_id", required=False)
@click.pass_context
def edit_metadata(ctx, song_id: Optional[str]):
    """Edit extended metadata for a song.

    If SONG_ID is not provided, you will be prompted to select interactively.
    """
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive selection if song_id not provided
    if not song_id:
        try:
            song_id = select_song_with_search(catalog_manager)
        except (ValidationError, click.Abort) as e:
            raise click.ClickException(str(e))

    # Verify song exists
    try:
        validate_song_exists(catalog_manager, song_id)
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Get song directory using utility function
    try:
        song_dir = get_song_directory(ctx.obj["catalog_path"], song_id, create=True)
    except PathResolutionError as e:
        raise click.ClickException(str(e))

    # Create or open metadata file
    metadata_file = song_dir / "metadata.yml"
    if not metadata_file.exists():
        # Create template
        default_metadata = """# Extended Metadata

performance:
  date: ""
  location: ""
  mood: ""
  take_number: 1
  improvised: false

recording:
  microphone: ""
  interface: ""
  daw: ""
  effects: []
  sample_rate: 44100
  bit_depth: 24

theory:
  key: ""
  time_signature: "4/4"
  tempo_bpm: 120
  chord_progression: []
  scale: ""
  techniques: []

tags: []
inspiration: ""
related_tracks: []
"""
        metadata_file.write_text(default_metadata)

    # Open in default editor
    editor = os.environ.get("EDITOR", "vim")
    subprocess.run([editor, str(metadata_file)])

    click.echo(f"Metadata updated for {song_id}")


@cli.command()
@click.argument("song_id", required=False)
@click.argument("project_path", type=click.Path(exists=True, path_type=Path), required=False)
@click.pass_context
def link_project(ctx, song_id: Optional[str], project_path: Optional[Path]):
    """Link a catalog song to a REAPER mixing project.

    This command parses the REAPER project file and stores track information
    in the song's metadata.yml file without processing audio files yet.

    If SONG_ID is not provided, you will be prompted to select interactively.
    If PROJECT_PATH is not provided, you will be prompted to enter it.

    Example:
        catalog-manager link-project diciembre-29-en-casa-9594 "/Users/ivanperdomo/Music/mixing/Diciembre 29 en casa"
    """
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive song selection if not provided
    if not song_id:
        try:
            song_id = select_song_with_search(catalog_manager)
        except (ValidationError, click.Abort) as e:
            raise click.ClickException(str(e))

    # Verify song exists
    try:
        validate_song_exists(catalog_manager, song_id)
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Get project path if not provided
    if not project_path:
        project_path_str = click.prompt("Enter path to REAPER project directory")
        project_path = Path(project_path_str)

    # Validate project directory exists
    try:
        project_path = validate_directory_exists(project_path, "REAPER project directory")
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Find the .RPP file in the project directory
    rpp_files = list(project_path.glob("*.RPP"))

    if not rpp_files:
        raise click.ClickException(
            f"No .RPP file found in {project_path}.\n"
            f"Expected to find a REAPER project file with .RPP extension."
        )

    if len(rpp_files) > 1:
        click.echo("Multiple .RPP files found. Please select one:")
        for i, rpp_file in enumerate(rpp_files, 1):
            click.echo(f"  {i}. {rpp_file.name}")
        try:
            index = safe_list_selection([f.name for f in rpp_files], "Enter number")
            rpp_file = rpp_files[index]
        except ValidationError as e:
            raise click.ClickException(str(e))
    else:
        rpp_file = rpp_files[0]

    click.echo(f"Parsing REAPER project: {rpp_file.name}")

    # Parse the REAPER project
    parser = ReaperParser(rpp_file)
    tracks = parser.parse()

    if not tracks:
        click.echo("Warning: No tracks with audio found in project", err=True)
        return

    click.echo(f"\nFound {len(tracks)} track(s) with audio:")
    for i, track in enumerate(tracks, 1):
        click.echo(f"  {i}. {track.name} ({track.color_hex}) - {len(track.audio_files)} audio file(s)")

    # Prepare mixing metadata
    mixing_data = {
        "project_path": project_path.name,  # Store relative to mixing directory
        "project_file": rpp_file.name,
        "last_processed": datetime.now().isoformat(),
        "tracks": []
    }

    # Convert tracks to metadata format
    for order, track in enumerate(tracks):
        # Generate track ID from track name
        track_id = sanitize_string(track.name)

        track_data = {
            "id": track_id,
            "name": track.name,
            "color": track.color_hex,
            "order": order,
            "audio_files": [],  # Will be populated by process-stems
            "peaks_url": "",    # Will be populated by process-stems
            "muted": False,
            "solo": False,
            "source_files": track.audio_files  # Store original source file paths
        }
        mixing_data["tracks"].append(track_data)

    # Get song directory using utility function
    try:
        song_dir = get_song_directory(ctx.obj["catalog_path"], song_id, create=True)
    except PathResolutionError as e:
        raise click.ClickException(str(e))

    metadata_file = song_dir / "metadata.yml"

    # Load existing metadata or create new
    if metadata_file.exists():
        with open(metadata_file, 'r') as f:
            metadata = yaml.safe_load(f) or {}
    else:
        # Create default metadata structure
        metadata = {
            "performance": {},
            "recording": {},
            "theory": {},
            "tags": [],
            "inspiration": "",
            "related_tracks": []
        }

    # Add mixing data
    metadata["mixing"] = mixing_data

    # Save updated metadata
    with open(metadata_file, 'w') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    click.echo(f"\n✓ Successfully linked project to {song_id}")
    click.echo(f"  Metadata saved to: {metadata_file}")
    click.echo(f"\nNext step: Run 'catalog-manager process-stems {song_id}' to convert audio files")


@cli.command()
@click.argument("song_id", required=False)
@click.option("--skip-conversion", is_flag=True, help="Skip audio conversion (for testing)")
@click.option("--mixing-dir", type=click.Path(path_type=Path), default=DEFAULT_MIXING_DIR, help="Path to mixing projects directory")
@click.pass_context
def process_stems(ctx, song_id: Optional[str], skip_conversion: bool, mixing_dir: Path):
    """Process track stems for a linked mixing project.

    Converts WAV files to MP3/OGG and generates waveform peaks for web display.

    If SONG_ID is not provided, you will be prompted to select interactively.

    Example:
        catalog-manager process-stems diciembre-29-en-casa-9594
    """
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive selection if song_id not provided
    if not song_id:
        try:
            song_id = select_song_with_search(catalog_manager)
        except (ValidationError, click.Abort) as e:
            raise click.ClickException(str(e))

    # Verify song exists
    try:
        validate_song_exists(catalog_manager, song_id)
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Get song directory using utility function
    try:
        song_dir = get_song_directory(ctx.obj["catalog_path"], song_id, create=False)
    except PathResolutionError as e:
        raise click.ClickException(str(e))

    metadata_file = song_dir / "metadata.yml"

    if not metadata_file.exists():
        raise click.ClickException(
            f"No metadata file found for {song_id}.\n"
            f"Run 'catalog-manager link-project {song_id} <project-path>' first"
        )

    # Load metadata
    with open(metadata_file, 'r') as f:
        metadata = yaml.safe_load(f) or {}

    # Check if mixing data exists
    if "mixing" not in metadata:
        raise click.ClickException(
            f"No mixing project linked for {song_id}.\n"
            f"Run 'catalog-manager link-project {song_id} <project-path>' first"
        )

    mixing_data = metadata["mixing"]
    project_path = mixing_dir / mixing_data["project_path"]

    # Validate mixing project directory exists
    try:
        project_path = validate_directory_exists(project_path, "Mixing project directory")
    except ValidationError as e:
        raise click.ClickException(
            f"{e}\n"
            f"Expected project at: {project_path}\n"
            f"Configured in metadata: {mixing_data['project_path']}\n"
            f"Mixing directory: {mixing_dir}\n"
            f"You may need to specify --mixing-dir if projects are in a different location."
        )

    # Create tracks output directory
    tracks_dir = song_dir / "tracks"
    tracks_dir.mkdir(parents=True, exist_ok=True)

    click.echo(f"Processing stems for: {song_id}")
    click.echo(f"Project directory: {project_path}")
    click.echo(f"Output directory: {tracks_dir}")
    click.echo()

    if skip_conversion:
        click.echo("⚠️  Skipping audio conversion (--skip-conversion flag)")
        return

    # Initialize audio processor
    try:
        processor = AudioProcessor()
    except AudioProcessingError as e:
        raise click.ClickException(str(e))

    # Process each track
    processed_count = 0
    total_tracks = len(mixing_data["tracks"])

    for track_idx, track_data in enumerate(mixing_data["tracks"], 1):
        track_id = track_data["id"]
        track_name = track_data["name"]
        source_files = track_data.get("source_files", [])

        click.echo(f"[{track_idx}/{total_tracks}] Processing: {track_name}")

        if not source_files:
            click.echo("  ⚠️  No source files found, skipping")
            continue

        # Use the first source file for now
        # (In a more complex implementation, you might want to mix multiple files)
        source_file_rel = source_files[0]
        source_file = project_path / source_file_rel

        if not source_file.exists():
            click.echo(f"  ✗ Source file not found: {source_file_rel}", err=True)
            continue

        try:
            # Process the track
            mp3_path, ogg_path, peaks_path = processor.process_track(
                input_file=source_file,
                output_dir=tracks_dir,
                track_id=track_id,
                bitrate=128,  # As per plan: 128 kbps
                ogg_quality=4  # As per plan: quality 4
            )

            # Update track data with output file URLs
            track_data["audio_files"] = [
                {"url": f"tracks/{mp3_path.name}", "format": "mp3"},
                {"url": f"tracks/{ogg_path.name}", "format": "ogg"}
            ]
            track_data["peaks_url"] = f"tracks/{peaks_path.name}"

            # Show file sizes
            mp3_size = processor.get_file_size_mb(mp3_path)
            ogg_size = processor.get_file_size_mb(ogg_path)
            peaks_size = processor.get_file_size_mb(peaks_path)

            click.echo(f"  ✓ MP3:   {mp3_path.name} ({mp3_size:.2f} MB)")
            click.echo(f"  ✓ OGG:   {ogg_path.name} ({ogg_size:.2f} MB)")
            click.echo(f"  ✓ Peaks: {peaks_path.name} ({peaks_size:.2f} MB)")

            processed_count += 1

        except AudioProcessingError as e:
            click.echo(f"  ✗ Error processing track: {e}", err=True)
            continue

    # Update last_processed timestamp
    mixing_data["last_processed"] = datetime.now().isoformat()

    # Save updated metadata
    with open(metadata_file, 'w') as f:
        yaml.dump(metadata, f, sort_keys=False, allow_unicode=True, default_flow_style=False)

    click.echo()
    click.echo(f"✓ Successfully processed {processed_count}/{total_tracks} track(s)")
    click.echo(f"  Metadata updated: {metadata_file}")
    click.echo(f"  Track files saved to: {tracks_dir}")


@cli.command()
@click.argument("song_id", required=False)
@click.pass_context
def show_notes(ctx, song_id: Optional[str]):
    """Display notes and metadata for a song.

    If SONG_ID is not provided, you will be prompted to select interactively.
    """
    catalog_manager = ctx.obj["catalog_manager"]

    # Interactive selection if song_id not provided
    if not song_id:
        try:
            song_id = select_song_with_search(catalog_manager)
        except (ValidationError, click.Abort) as e:
            raise click.ClickException(str(e))

    # Verify song exists
    try:
        validate_song_exists(catalog_manager, song_id)
    except ValidationError as e:
        raise click.ClickException(str(e))

    # Get song directory using utility function
    try:
        song_dir = get_song_directory(ctx.obj["catalog_path"], song_id, create=False)
    except PathResolutionError as e:
        raise click.ClickException(str(e))

    # Display notes
    notes_file = song_dir / "notes.md"
    if notes_file.exists():
        click.echo("\n" + "=" * 80)
        click.echo("NOTES")
        click.echo("=" * 80)
        click.echo(notes_file.read_text())
    else:
        click.echo(f"\nNo notes file found at {notes_file}")

    # Display metadata
    metadata_file = song_dir / "metadata.yml"
    if metadata_file.exists():
        click.echo("\n" + "=" * 80)
        click.echo("METADATA")
        click.echo("=" * 80)
        click.echo(metadata_file.read_text())
    else:
        click.echo(f"\nNo metadata file found at {metadata_file}")


def main():
    cli(obj={})


if __name__ == "__main__":
    main()
