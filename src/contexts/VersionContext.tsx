import { createContext, useContext, useState, useCallback, type ReactNode } from "react";

export interface VersionEntry {
  id: string;
  timestamp: Date;
  action: string;
  fileName: string;
  dataUrl?: string;
  size?: number;
}

interface VersionContextType {
  history: VersionEntry[];
  addVersion: (entry: Omit<VersionEntry, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

const VersionContext = createContext<VersionContextType | undefined>(undefined);

export const VersionProvider = ({ children }: { children: ReactNode }) => {
  const [history, setHistory] = useState<VersionEntry[]>([]);

  const addVersion = useCallback((entry: Omit<VersionEntry, "id" | "timestamp">) => {
    setHistory((prev) => [
      {
        ...entry,
        id: crypto.randomUUID(),
        timestamp: new Date(),
      },
      ...prev,
    ].slice(0, 50)); // keep last 50
  }, []);

  const clearHistory = useCallback(() => setHistory([]), []);

  return (
    <VersionContext.Provider value={{ history, addVersion, clearHistory }}>
      {children}
    </VersionContext.Provider>
  );
};

export const useVersionHistory = () => {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error("useVersionHistory must be used within VersionProvider");
  return ctx;
};
