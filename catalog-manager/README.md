# Catalog Manager

A CLI tool for managing a music catalog with support for song metadata, file verification, and REAPER project integration.

## Features

- Add songs to a YAML-based catalog with metadata, tags, and checksums
- Verify file integrity using SHA-256 hashes
- Edit markdown notes and extended metadata for each song
- Link REAPER mixing projects and parse track information
- Process audio stems (WAV to MP3/OGG conversion with waveform peaks)
- **Interactive song selection with fzf** - fuzzy find songs without memorizing IDs

## Requirements

- Python >= 3.8
- [fzf](https://github.com/junegunn/fzf) - for interactive song selection
  - **macOS**: `brew install fzf`
  - **Linux**: `sudo apt install fzf` (or use your package manager)
  - **Windows**: See [fzf installation guide](https://github.com/junegunn/fzf#installation)

## Quick Start

All commands that require a song ID support interactive selection with fzf. Simply omit the song ID and fzf will open for fuzzy finding:

```bash
# Interactive selection (opens fzf)
catalog-manager edit-notes
catalog-manager show-notes
catalog-manager process-stems

# Or use the song ID directly
catalog-manager edit-notes diciembre-29-en-casa-9594
```

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
