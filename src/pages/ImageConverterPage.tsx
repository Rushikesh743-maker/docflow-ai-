import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { ArrowRightLeft, Download, Trash2 } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

type OutputFormat = "image/jpeg" | "image/png" | "image/webp";

const formats: { id: OutputFormat; label: string; ext: string }[] = [
  { id: "image/jpeg", label: "JPG", ext: "jpg" },
  { id: "image/png", label: "PNG", ext: "png" },
  { id: "image/webp", label: "WebP", ext: "webp" },
];

const ImageConverterPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [processing, setProcessing] = useState(false);

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (i: number) => setFiles((prev) => prev.filter((_, idx) => idx !== i));

  const convertAndDownload = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    try {
      const selectedExt = formats.find((f) => f.id === outputFormat)!.ext;

      for (const file of files) {
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

        const quality = outputFormat === "image/png" ? undefined : 0.92;
        const blob = await new Promise<Blob>((resolve) =>
          canvas.toBlob((b) => resolve(b!), outputFormat, quality)
        );

        const name = file.name.replace(/\.[^.]+$/, `.${selectedExt}`);
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob);
        a.download = name;
        a.click();
        URL.revokeObjectURL(a.href);
      }
      toast.success(`${files.length} image(s) converted to ${selectedExt.toUpperCase()}`);
    } catch {
      toast.error("Conversion failed");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-accent">
            <ArrowRightLeft className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Format Converter</h1>
        </div>
        <p className="text-muted-foreground">Convert between JPG, PNG, and WebP formats</p>
      </motion.div>

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"], "image/bmp": [".bmp"] }}
        label="Drop images to convert"
        sublabel="Supports JPG, PNG, WebP, BMP"
      />

      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Output Format</label>
        <div className="flex gap-2">
          {formats.map((fmt) => (
            <button
              key={fmt.id}
              onClick={() => setOutputFormat(fmt.id)}
              className={`px-5 py-2.5 rounded-lg text-sm font-medium transition-all ${
                outputFormat === fmt.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {fmt.label}
            </button>
          ))}
        </div>
      </div>

      {files.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">{files.length} file(s)</h3>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <span className="flex-1 text-sm text-card-foreground truncate">{f.name}</span>
              <span className="text-xs text-muted-foreground">{(f.size / 1024).toFixed(1)} KB</span>
              <button onClick={() => removeFile(i)} className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive">
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
          <Button onClick={convertAndDownload} disabled={processing} className="gradient-accent text-accent-foreground hover:opacity-90 px-8" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {processing ? "Converting..." : `Convert to ${formats.find((f) => f.id === outputFormat)!.label}`}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default ImageConverterPage;
