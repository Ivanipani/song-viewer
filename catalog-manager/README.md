# Catalog Manager

A CLI tool for managing a music catalog with support for song metadata, file verification, and REAPER project integration.

## Features

- Add songs to a YAML-based catalog with metadata, tags, and checksums
- Verify file integrity using SHA-256 hashes
- Edit markdown notes and extended metadata for each song
- Link REAPER mixing projects and parse track information
- Process audio stems (WAV to MP3/OGG conversion with waveform peaks)

## Usage

```
Usage: catalog-manager [OPTIONS] COMMAND [ARGS]...

  Manage your song catalog.

Options:
  -c, --catalog PATH  Path to catalog file
  --help              Show this message and exit.

Commands:
  add            Add a song to the catalog.
  edit-metadata  Edit extended metadata for a song.
  edit-notes     Edit markdown notes for a song.
  link-project   Link a catalog song to a REAPER mixing project.
  process-stems  Process track stems for a linked mixing project.
  show           List all songs in the catalog.
  show-notes     Display notes and metadata for a song.
  verify         Verify all file hashes in the catalog.
```
