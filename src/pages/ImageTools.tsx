import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import { Download, Trash2, Image, FileText } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

const ImageTools = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [processing, setProcessing] = useState(false);

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    newFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviews((prev) => [...prev, e.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleConvertToPdf = async () => {
    if (files.length === 0) {
      toast.error("Please add at least 1 image");
      return;
    }
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();

      for (const file of files) {
        const bytes = await file.arrayBuffer();
        let image;
        if (file.type === "image/png") {
          image = await pdfDoc.embedPng(bytes);
        } else {
          image = await pdfDoc.embedJpg(bytes);
        }

        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, {
          x: 0,
          y: 0,
          width: image.width,
          height: image.height,
        });
      }

      const pdfBytes = await pdfDoc.save();
      downloadBlob(new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }), "images.pdf");
      toast.success("Images converted to PDF!");
    } catch (e) {
      toast.error("Failed to convert images");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Image Tools</h1>
        <p className="text-muted-foreground mt-1">Convert images to PDF and more</p>
      </motion.div>

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        accept={{
          "image/jpeg": [".jpg", ".jpeg"],
          "image/png": [".png"],
          "image/webp": [".webp"],
        }}
        label="Drop images here"
        sublabel="Supports JPG, PNG, WebP"
      />

      {/* Previews */}
      {previews.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="text-sm font-medium text-foreground">
            {files.length} image{files.length > 1 ? "s" : ""} selected
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {previews.map((preview, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-square">
                <img
                  src={preview}
                  alt={files[i]?.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all flex items-center justify-center">
                  <button
                    onClick={() => removeFile(i)}
                    className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-card/90 text-destructive transition-all"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-0 left-0 right-0 p-2 bg-gradient-to-t from-foreground/60 to-transparent">
                  <p className="text-xs text-primary-foreground truncate">{files[i]?.name}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {files.length > 0 && (
        <Button
          onClick={handleConvertToPdf}
          disabled={processing}
          className="gradient-primary text-primary-foreground hover:opacity-90 px-8"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {processing ? "Converting..." : "Convert to PDF"}
        </Button>
      )}
    </div>
  );
};

export default ImageTools;
