import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface BrowserInfo {
  isMobile: boolean;
  browserName: string;
  browserVersion: string;
  isIOS: boolean;
  isAndroid: boolean;
}

interface BrowserContextType {
  browserInfo: BrowserInfo;
}

const BrowserContext = createContext<BrowserContextType | undefined>(undefined);

function detectBrowser(): { name: string; version: string } {
  const userAgent = navigator.userAgent;
  let browserName = "Unknown";
  let browserVersion = "Unknown";

  if (userAgent.match(/chrome|chromium|crios/i)) {
    browserName = "Chrome";
  } else if (userAgent.match(/firefox|fxios/i)) {
    browserName = "Firefox";
  } else if (userAgent.match(/safari/i)) {
    browserName = "Safari";
  } else if (userAgent.match(/opr\//i)) {
    browserName = "Opera";
  } else if (userAgent.match(/edg/i)) {
    browserName = "Edge";
  }

  // Extract version number
  const match = userAgent.match(
    /(chrome|firefox|safari|opr|edg)\/?\s*(\d+(\.\d+)*)/i
  );
  if (match) {
    browserVersion = match[2];
  }

  return { name: browserName, version: browserVersion };
}

export function BrowserProvider({ children }: { children: ReactNode }) {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    isMobile: false,
    browserName: "",
    browserVersion: "",
    isIOS: false,
    isAndroid: false,
  });

  useEffect(() => {
    // Mobile detection using media query
    const mobileQuery = window.matchMedia("(max-width: 768px)");

    // Detect browser info
    const { name, version } = detectBrowser();

    // Detect iOS/Android
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isAndroid = /Android/.test(navigator.userAgent);

    const updateBrowserInfo = (e?: MediaQueryListEvent) => {
      setBrowserInfo({
        isMobile: e ? e.matches : mobileQuery.matches,
        browserName: name,
        browserVersion: version,
        isIOS,
        isAndroid,
      });
    };

    // Initial check
    updateBrowserInfo();

    // Listen for changes in media query
    mobileQuery.addEventListener("change", updateBrowserInfo);

    return () => {
      mobileQuery.removeEventListener("change", updateBrowserInfo);
    };
  }, []);

  return (
    <BrowserContext.Provider value={{ browserInfo }}>
      {children}
    </BrowserContext.Provider>
  );
}

export function useBrowser() {
  const context = useContext(BrowserContext);
  if (context === undefined) {
    throw new Error("useBrowser must be used within a BrowserProvider");
  }
  return context;
}
