#!/usr/bin/env python3
import click
import yaml
import hashlib
from pathlib import Path
from datetime import datetime
import os
from typing import Optional, List
from pydantic import BaseModel, Field


class Song(BaseModel):
    id: str
    title: str
    artist: str
    filename: str
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
        return cls(
            id=f"{artist}-{title}".lower().replace(" ", "-"),
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
        else:
            with open(self.catalog_path, "r") as f:
                catalog = yaml.safe_load(f) or {"songs": []}
                # Convert dicts to Song models
                return Catalog(songs=[Song(**song) for song in catalog["songs"]])

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


def main():
    cli(obj={})


if __name__ == "__main__":
    main()
