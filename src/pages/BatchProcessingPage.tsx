import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Layers, Download, Trash2, Check } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type BatchAction = "compress" | "resize" | "convert";

const actions: { id: BatchAction; label: string; description: string }[] = [
  { id: "compress", label: "Compress", description: "Reduce file sizes with quality control" },
  { id: "resize", label: "Resize", description: "Resize all images to same dimensions" },
  { id: "convert", label: "Convert to JPG", description: "Convert all images to JPEG format" },
];

const BatchProcessingPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [action, setAction] = useState<BatchAction>("compress");
  const [quality, setQuality] = useState([75]);
  const [maxWidth, setMaxWidth] = useState([1920]);
  const [processing, setProcessing] = useState(false);
  const [processed, setProcessed] = useState(0);

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const processImage = async (file: File): Promise<Blob> => {
    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.src = url;
    await new Promise((resolve) => (img.onload = resolve));

    const canvas = document.createElement("canvas");
    let w = img.width;
    let h = img.height;

    if (action === "resize" && w > maxWidth[0]) {
      const ratio = maxWidth[0] / w;
      w = maxWidth[0];
      h = Math.round(h * ratio);
    }

    canvas.width = w;
    canvas.height = h;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, w, h);
    URL.revokeObjectURL(url);

    const mimeType = action === "convert" ? "image/jpeg" : file.type === "image/png" && action !== "compress" ? "image/png" : "image/jpeg";
    const q = action === "compress" ? quality[0] / 100 : 0.92;

    return new Promise((resolve) => canvas.toBlob((b) => resolve(b!), mimeType, q));
  };

  const handleProcess = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setProcessed(0);

    try {
      for (let i = 0; i < files.length; i++) {
        const blob = await processImage(files[i]);
        const ext = action === "convert" ? "jpg" : files[i].name.split(".").pop();
        const name = files[i].name.replace(/\.[^.]+$/, `_processed.${ext}`);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
        setProcessed(i + 1);
        await new Promise((r) => setTimeout(r, 100));
      }
      toast.success(`${files.length} files processed!`);
    } catch {
      toast.error("Batch processing failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-warm">
            <Layers className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Batch Processing</h1>
        </div>
        <p className="text-muted-foreground">Apply the same operation to multiple images at once</p>
      </motion.div>

      <div className="grid gap-3 sm:grid-cols-3">
        {actions.map((a) => (
          <button
            key={a.id}
            onClick={() => setAction(a.id)}
            className={`p-4 rounded-xl border text-left transition-all ${
              action === a.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"
            }`}
          >
            <p className={`text-sm font-semibold ${action === a.id ? "text-primary" : "text-card-foreground"}`}>{a.label}</p>
            <p className="text-xs text-muted-foreground mt-1">{a.description}</p>
          </button>
        ))}
      </div>

      {action === "compress" && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-foreground">Quality</label>
            <span className="text-sm font-mono text-muted-foreground">{quality[0]}%</span>
          </div>
          <Slider value={quality} onValueChange={setQuality} min={10} max={100} step={5} />
        </div>
      )}

      {action === "resize" && (
        <div className="space-y-2">
          <div className="flex justify-between">
            <label className="text-sm font-medium text-foreground">Max Width</label>
            <span className="text-sm font-mono text-muted-foreground">{maxWidth[0]}px</span>
          </div>
          <Slider value={maxWidth} onValueChange={setMaxWidth} min={320} max={3840} step={80} />
        </div>
      )}

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
        label="Drop images for batch processing"
        sublabel="Supports JPG, PNG, WebP"
      />

      {files.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-foreground">{files.length} file(s)</h3>
            <Button variant="ghost" size="sm" onClick={() => setFiles([])}>Clear all</Button>
          </div>

          {processing && (
            <div className="w-full bg-muted rounded-full h-2">
              <div className="bg-primary h-2 rounded-full transition-all" style={{ width: `${(processed / files.length) * 100}%` }} />
            </div>
          )}

          <Button onClick={handleProcess} disabled={processing} className="gradient-warm text-primary-foreground hover:opacity-90 px-8" size="lg">
            {processing ? (
              <>{processed}/{files.length} processed...</>
            ) : (
              <><Layers className="w-4 h-4 mr-2" /> Process {files.length} Files</>
            )}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default BatchProcessingPage;
