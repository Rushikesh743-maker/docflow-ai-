import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { Download, FileText, Minimize2 } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const CompressPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [quality, setQuality] = useState([70]);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<{ blob: Blob; size: number } | null>(null);

  const handleFilesAccepted = useCallback((files: File[]) => {
    setFile(files[0]);
    setResult(null);
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCompress = async () => {
    if (!file) return;
    setProcessing(true);

    try {
      if (file.type.startsWith("image/")) {
        // Compress image using canvas
        const img = new window.Image();
        const url = URL.createObjectURL(file);
        img.src = url;
        await new Promise((resolve) => (img.onload = resolve));

        const canvas = document.createElement("canvas");
        canvas.width = img.width;
        canvas.height = img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.drawImage(img, 0, 0);
        URL.revokeObjectURL(url);

        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), "image/jpeg", quality[0] / 100)
        );
        setResult({ blob, size: blob.size });
        toast.success("Image compressed!");
      } else {
        // For PDFs, we just show a message since real compression needs a backend
        toast.info("PDF compression requires server-side processing. Download the original for now.");
        setResult({ blob: file, size: file.size });
      }
    } catch {
      toast.error("Compression failed");
    } finally {
      setProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Compress</h1>
        <p className="text-muted-foreground mt-1">Reduce file sizes for easy sharing</p>
      </motion.div>

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        multiple={false}
        label="Drop a file to compress"
        sublabel="Images and PDFs supported"
      />

      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-card border border-border">
            <FileText className="w-5 h-5 text-primary" />
            <div className="flex-1">
              <p className="text-sm font-medium text-card-foreground">{file.name}</p>
              <p className="text-xs text-muted-foreground">Original: {formatSize(file.size)}</p>
            </div>
          </div>

          {file.type.startsWith("image/") && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">Quality</label>
                <span className="text-sm font-mono text-muted-foreground">{quality[0]}%</span>
              </div>
              <Slider
                value={quality}
                onValueChange={setQuality}
                max={100}
                min={10}
                step={5}
                className="w-full"
              />
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>Smaller file</span>
                <span>Better quality</span>
              </div>
            </div>
          )}

          {/* Size comparison */}
          {result && (
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-xl bg-muted text-center">
                <p className="text-xs text-muted-foreground mb-1">Original</p>
                <p className="text-lg font-semibold text-foreground">{formatSize(file.size)}</p>
              </div>
              <div className="p-4 rounded-xl bg-accent/10 text-center">
                <p className="text-xs text-muted-foreground mb-1">Compressed</p>
                <p className="text-lg font-semibold text-accent">{formatSize(result.size)}</p>
                <p className="text-xs text-accent mt-1">
                  {Math.round((1 - result.size / file.size) * 100)}% smaller
                </p>
              </div>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleCompress}
              disabled={processing}
              className="gradient-primary text-primary-foreground hover:opacity-90"
              size="lg"
            >
              <Minimize2 className="w-4 h-4 mr-2" />
              {processing ? "Compressing..." : "Compress"}
            </Button>

            {result && (
              <Button
                onClick={() =>
                  downloadBlob(result.blob, `compressed_${file.name}`)
                }
                variant="outline"
                size="lg"
              >
                <Download className="w-4 h-4 mr-2" />
                Download
              </Button>
            )}
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CompressPage;
