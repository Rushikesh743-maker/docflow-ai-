import { motion } from "framer-motion";
import { Clock, Trash2, FileText, Download } from "lucide-react";
import { useVersionHistory } from "@/contexts/VersionContext";
import { Button } from "@/components/ui/button";

const VersionHistoryPage = () => {
  const { history, clearHistory } = useVersionHistory();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) +
      " · " +
      date.toLocaleDateString([], { month: "short", day: "numeric" });
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-accent">
            <Clock className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Time Machine</h1>
        </div>
        <p className="text-muted-foreground">Track every action performed on your files this session</p>
      </motion.div>

      {history.length > 0 && (
        <div className="flex justify-end">
          <Button variant="ghost" size="sm" onClick={clearHistory} className="text-muted-foreground">
            <Trash2 className="w-4 h-4 mr-1.5" /> Clear History
          </Button>
        </div>
      )}

      {history.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="p-4 rounded-2xl bg-muted mb-4">
            <Clock className="w-10 h-10 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">No history yet</h3>
          <p className="text-sm text-muted-foreground mt-1 max-w-sm">
            Process files using any tool — your actions will be tracked here for this session.
          </p>
        </div>
      ) : (
        <div className="relative">
          <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border" />
          <div className="space-y-4">
            {history.map((entry, i) => (
              <motion.div
                key={entry.id}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-4 relative"
              >
                <div className="w-10 h-10 rounded-full bg-card border-2 border-border flex items-center justify-center z-10 flex-shrink-0">
                  <FileText className="w-4 h-4 text-primary" />
                </div>
                <div className="flex-1 p-4 rounded-xl bg-card border border-border">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-medium text-card-foreground">{entry.action}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{entry.fileName}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground whitespace-nowrap">{formatTime(entry.timestamp)}</span>
                  </div>
                  {entry.size && (
                    <p className="text-xs text-muted-foreground mt-2">Size: {(entry.size / 1024).toFixed(1)} KB</p>
                  )}
                  {entry.dataUrl && (
                    <a href={entry.dataUrl} download={entry.fileName} className="inline-flex items-center gap-1 text-xs text-primary mt-2 hover:underline">
                      <Download className="w-3 h-3" /> Re-download
                    </a>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default VersionHistoryPage;
