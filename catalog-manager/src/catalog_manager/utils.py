"""Utility functions for catalog management."""

from pathlib import Path
from typing import Optional, Dict, Any, List
import click
import yaml


# ============================================================================
# Custom Exceptions
# ============================================================================

class CatalogError(Exception):
    """Base exception for catalog operations."""
    pass


class ValidationError(CatalogError):
    """Raised when validation fails."""
    pass


class PathResolutionError(CatalogError):
    """Raised when path resolution fails."""
    pass


# ============================================================================
# Song Validation
# ============================================================================

def validate_song_exists(catalog_manager, song_id: str) -> bool:
    """Validate that a song exists in the catalog.

    Args:
        catalog_manager: CatalogManager instance
        song_id: Song ID to validate

    Returns:
        True if valid

    Raises:
        ValidationError: If song does not exist
    """
    if not catalog_manager.contains(song_id):
        raise ValidationError(
            f"Song with ID '{song_id}' not found in catalog.\n"
            f"Use 'catalog-manager show' to list available songs."
        )
    return True


def get_song_by_id(catalog_manager, song_id: str):
    """Get a song from the catalog by ID.

    Args:
        catalog_manager: CatalogManager instance
        song_id: Song ID to retrieve

    Returns:
        Song object

    Raises:
        ValidationError: If song does not exist
    """
    validate_song_exists(catalog_manager, song_id)
    # Safe: we've validated the song exists
    try:
        return next(s for s in catalog_manager.songs if s.id == song_id)
    except StopIteration:
        # Should never happen due to validation, but handle gracefully
        raise ValidationError(f"Song '{song_id}' exists in catalog but could not be retrieved")


# ============================================================================
# Path Handling
# ============================================================================

def resolve_catalog_paths(catalog_path: Path) -> tuple:
    """Resolve catalog directory and ensure it exists.

    Args:
        catalog_path: Path to catalog.yml file

    Returns:
        Tuple of (catalog_dir, catalog_path)

    Raises:
        PathResolutionError: If paths cannot be resolved
    """
    try:
        # Convert to absolute path
        catalog_path = catalog_path.resolve()
        catalog_dir = catalog_path.parent

        # Ensure catalog directory exists
        catalog_dir.mkdir(parents=True, exist_ok=True)

        return catalog_dir, catalog_path
    except Exception as e:
        raise PathResolutionError(f"Failed to resolve catalog path: {e}")


def get_song_directory(catalog_path: Path, song_id: str, create: bool = True) -> Path:
    """Get the directory for a specific song.

    Args:
        catalog_path: Path to catalog.yml file
        song_id: Song ID
        create: Whether to create the directory if it doesn't exist

    Returns:
        Path to song directory

    Raises:
        PathResolutionError: If directory cannot be accessed
    """
    try:
        catalog_dir, _ = resolve_catalog_paths(catalog_path)
        song_dir = catalog_dir / song_id

        if create:
            song_dir.mkdir(parents=True, exist_ok=True)
        elif not song_dir.exists():
            raise PathResolutionError(f"Song directory does not exist: {song_dir}")

        return song_dir
    except Exception as e:
        if isinstance(e, PathResolutionError):
            raise
        raise PathResolutionError(f"Failed to access song directory: {e}")


def validate_file_exists(file_path: Path, file_type: str = "File") -> Path:
    """Validate that a file exists and is readable.

    Args:
        file_path: Path to validate
        file_type: Description of file type for error message

    Returns:
        Resolved absolute path

    Raises:
        ValidationError: If file doesn't exist or isn't readable
    """
    try:
        resolved_path = file_path.resolve()
        if not resolved_path.exists():
            raise ValidationError(f"{file_type} not found: {file_path}")
        if not resolved_path.is_file():
            raise ValidationError(f"Path is not a file: {file_path}")
        return resolved_path
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f"Cannot access {file_type.lower()}: {e}")


def validate_directory_exists(dir_path: Path, dir_type: str = "Directory") -> Path:
    """Validate that a directory exists.

    Args:
        dir_path: Path to validate
        dir_type: Description of directory type for error message

    Returns:
        Resolved absolute path

    Raises:
        ValidationError: If directory doesn't exist
    """
    try:
        resolved_path = dir_path.resolve()
        if not resolved_path.exists():
            raise ValidationError(f"{dir_type} not found: {dir_path}")
        if not resolved_path.is_dir():
            raise ValidationError(f"Path is not a directory: {dir_path}")
        return resolved_path
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f"Cannot access {dir_type.lower()}: {e}")


# ============================================================================
# User Input Helpers
# ============================================================================

def safe_list_selection(items: list, prompt: str = "Enter number") -> int:
    """Safely prompt user to select from a list.

    Args:
        items: List of items to select from (can be any type)
        prompt: Prompt message

    Returns:
        0-based index of selected item

    Raises:
        click.Abort: If user cancels
        ValidationError: If no items to select
    """
    if not items:
        raise ValidationError("No items to select from")

    max_choice = len(items)

    while True:
        try:
            choice = click.prompt(prompt, type=int)
            if 1 <= choice <= max_choice:
                return choice - 1  # Convert to 0-based index
            else:
                click.echo(f"Please enter a number between 1 and {max_choice}", err=True)
        except click.Abort:
            raise
        except Exception:
            click.echo(f"Please enter a valid number between 1 and {max_choice}", err=True)


# ============================================================================
# Interactive Song Selection
# ============================================================================

def interactive_song_selection(catalog_manager, prompt: str = "Select a song") -> str:
    """Interactively select a song from the catalog.

    Args:
        catalog_manager: CatalogManager instance
        prompt: Prompt message to display

    Returns:
        Selected song ID

    Raises:
        click.Abort: If user cancels
        ValidationError: If catalog is empty
    """
    if not catalog_manager.songs:
        raise ValidationError("Catalog is empty. Add songs with 'catalog-manager add' first.")

    click.echo(f"\n{prompt}:")
    click.echo("-" * 80)

    # Create display list with song info
    song_display = []
    for song in catalog_manager.songs:
        display = f"{song.title} - {song.artist} (ID: {song.id})"
        song_display.append(display)
        click.echo(f"  {len(song_display)}. {display}")

    try:
        index = safe_list_selection(song_display, "Enter song number")
        return catalog_manager.songs[index].id
    except click.Abort:
        click.echo("\nSelection cancelled")
        raise


def fuzzy_search_songs(catalog_manager, query: str, limit: int = 5) -> List:
    """Simple fuzzy search for songs by title, artist, or ID.

    Args:
        catalog_manager: CatalogManager instance
        query: Search query
        limit: Maximum results to return

    Returns:
        List of matching songs
    """
    query_lower = query.lower()
    matches = []

    for song in catalog_manager.songs:
        # Simple substring matching
        if (query_lower in song.title.lower() or
            query_lower in song.artist.lower() or
            query_lower in song.id.lower()):
            matches.append(song)

    return matches[:limit]


def select_song_with_search(catalog_manager) -> str:
    """Select a song with optional search functionality.

    Args:
        catalog_manager: CatalogManager instance

    Returns:
        Selected song ID

    Raises:
        click.Abort: If user cancels
        ValidationError: If catalog is empty
    """
    if not catalog_manager.songs:
        raise ValidationError("Catalog is empty. Add songs with 'catalog-manager add' first.")

    # Offer search for larger catalogs
    if len(catalog_manager.songs) > 10:
        if click.confirm("Would you like to search for a song?", default=True):
            while True:
                query = click.prompt("Search (title, artist, or ID)")
                matches = fuzzy_search_songs(catalog_manager, query)

                if not matches:
                    click.echo("No matches found. Try again.")
                    if not click.confirm("Search again?", default=True):
                        break
                    continue

                if len(matches) == 1:
                    song = matches[0]
                    if click.confirm(f"Use '{song.title}' by {song.artist}?", default=True):
                        return song.id
                else:
                    click.echo(f"\nFound {len(matches)} match(es):")
                    # Create temporary manager-like object with filtered songs
                    class FilteredManager:
                        def __init__(self, songs):
                            self.songs = songs

                    try:
                        return interactive_song_selection(
                            FilteredManager(matches),
                            "Select from search results"
                        )
                    except click.Abort:
                        if not click.confirm("Search again?", default=True):
                            break

    # Default: show all songs
    return interactive_song_selection(catalog_manager, "Select a song")


# ============================================================================
# YAML Helpers
# ============================================================================

def load_yaml_safe(file_path: Path, expected_keys: Optional[List[str]] = None) -> Dict[str, Any]:
    """Safely load and validate YAML file.

    Args:
        file_path: Path to YAML file
        expected_keys: Optional list of required top-level keys

    Returns:
        Parsed YAML as dictionary

    Raises:
        ValidationError: If YAML is invalid or missing required keys
    """
    try:
        with open(file_path, 'r') as f:
            data = yaml.safe_load(f)

        if data is None:
            data = {}

        if not isinstance(data, dict):
            raise ValidationError(f"YAML file must contain a dictionary, got {type(data).__name__}")

        # Validate expected keys if provided
        if expected_keys:
            missing_keys = set(expected_keys) - set(data.keys())
            if missing_keys:
                raise ValidationError(
                    f"YAML file missing required keys: {', '.join(missing_keys)}\n"
                    f"File: {file_path}"
                )

        return data
    except yaml.YAMLError as e:
        raise ValidationError(f"Invalid YAML in {file_path}: {e}")
    except FileNotFoundError:
        raise ValidationError(f"File not found: {file_path}")
    except Exception as e:
        if isinstance(e, ValidationError):
            raise
        raise ValidationError(f"Failed to load YAML from {file_path}: {e}")
