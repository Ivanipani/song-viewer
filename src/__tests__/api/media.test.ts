import { describe, test, expect, mock, beforeEach } from "bun:test";
import { fetchAudioCatalog, fetchPhotos, fetchTrackNotes, fetchTrackMetadata } from "../../api/media";

// Mock global fetch
const mockFetch = mock(() => Promise.resolve());
global.fetch = mockFetch as any;

beforeEach(() => {
  mockFetch.mockClear();
});

describe("fetchAudioCatalog", () => {
  test("successfully parses catalog YAML and adds URLs", async () => {
    // GIVEN: A valid catalog.yml response
    const mockYaml = `songs:
  - id: test-song
    title: Test Song
    artist: Test Artist
    filename: test.mp3
    checksum: abc123
    tags: []
    added_date: "2024-01-01"
    metadata: {}`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockYaml),
    });

    // WHEN: Fetching the audio catalog
    const result = await fetchAudioCatalog();

    // THEN: Songs have URLs and indexes added
    expect(result.songs).toHaveLength(1);
    expect(result.songs[0].url).toContain("/test-song/master.mp3");
    expect(result.songs[0].index).toBe(0);
  });

  test("throws error when catalog fetch fails", async () => {
    // GIVEN: A failed fetch response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // WHEN/THEN: Fetching catalog throws error
    await expect(fetchAudioCatalog()).rejects.toThrow("Failed to fetch audio catalog");
  });
});

describe("fetchPhotos", () => {
  test("successfully maps photo names to URLs", async () => {
    // GIVEN: A valid photos JSON response
    const mockPhotos = [
      { name: "photo1.jpg" },
      { name: "photo2.jpg" },
    ];

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: () => Promise.resolve(mockPhotos),
    });

    // WHEN: Fetching photos
    const result = await fetchPhotos();

    // THEN: Photo URLs are constructed correctly
    expect(result).toHaveLength(2);
    expect(result[0]).toContain("/photo1.jpg");
    expect(result[1]).toContain("/photo2.jpg");
  });

  test("throws error when photos fetch fails", async () => {
    // GIVEN: A failed fetch response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      statusText: "Server Error",
    });

    // WHEN/THEN: Fetching photos throws error
    await expect(fetchPhotos()).rejects.toThrow("Failed to fetch photos");
  });
});

describe("fetchTrackNotes", () => {
  test("returns notes content when found", async () => {
    // GIVEN: A valid notes.md response
    const mockNotes = "# Test Notes\nSome content";

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockNotes),
    });

    // WHEN: Fetching track notes
    const result = await fetchTrackNotes("test-track");

    // THEN: Notes content is returned
    expect(result).not.toBeNull();
    expect(result?.content).toBe(mockNotes);
  });

  test("returns null when notes not found (404)", async () => {
    // GIVEN: A 404 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // WHEN: Fetching non-existent track notes
    const result = await fetchTrackNotes("missing-track");

    // THEN: Returns null without throwing
    expect(result).toBeNull();
  });

  test("returns null on fetch error", async () => {
    // GIVEN: A network error
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    // WHEN: Fetching track notes with error
    const result = await fetchTrackNotes("test-track");

    // THEN: Returns null gracefully
    expect(result).toBeNull();
  });
});

describe("fetchTrackMetadata", () => {
  test("successfully parses metadata YAML", async () => {
    // GIVEN: A valid metadata.yml response
    const mockYaml = `theory:
  key: C Major
  tempo_bpm: 120
performance:
  mood: happy`;

    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve(mockYaml),
    });

    // WHEN: Fetching track metadata
    const result = await fetchTrackMetadata("test-track");

    // THEN: Metadata is parsed correctly
    expect(result).not.toBeNull();
    expect(result?.theory?.key).toBe("C Major");
    expect(result?.theory?.tempo_bpm).toBe(120);
    expect(result?.performance?.mood).toBe("happy");
  });

  test("returns null when metadata not found (404)", async () => {
    // GIVEN: A 404 response
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
    });

    // WHEN: Fetching non-existent metadata
    const result = await fetchTrackMetadata("missing-track");

    // THEN: Returns null without throwing
    expect(result).toBeNull();
  });

  test("returns null on parse error", async () => {
    // GIVEN: Invalid YAML that causes parse error
    mockFetch.mockResolvedValueOnce({
      ok: true,
      text: () => Promise.resolve("invalid: yaml: content:"),
    });

    // WHEN: Fetching metadata with invalid YAML
    const result = await fetchTrackMetadata("test-track");

    // THEN: Returns null gracefully
    expect(result).toBeNull();
  });
});
