import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { fetchAudioCatalog, AudioCatalog } from "../api/canciones";
import { fetchPhotos } from "../api/fotos";

interface MediaContextType {
  catalog: AudioCatalog | null;
  photos: string[];
  loading: boolean;
  error: boolean;
}

const MediaContext = createContext<MediaContextType | undefined>(undefined);

export function MediaProvider({ children }: { children: ReactNode }) {
  const [catalog, setCatalog] = useState<AudioCatalog | null>(null);
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<boolean>(false);

  useEffect(() => {
    setLoading(true);
    fetchAudioCatalog()
      .then((c) => {
        setCatalog(c);
        fetchPhotos().then((p) => {
          setPhotos(p);
        });
        setLoading(false);
      })
      .catch((e) => {
        console.error(e);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <MediaContext.Provider value={{ catalog, photos, loading, error }}>
      {children}
    </MediaContext.Provider>
  );
}

export function useMedia() {
  const context = useContext(MediaContext);
  if (context === undefined) {
    throw new Error("useMedia must be used within a MediaProvider");
  }
  return context;
}
