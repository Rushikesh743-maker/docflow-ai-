import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PDFDocument, rgb, degrees, StandardFonts } from "pdf-lib";
import { Droplets, Download } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const PdfWatermarkPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [watermarkText, setWatermarkText] = useState("CONFIDENTIAL");
  const [opacity, setOpacity] = useState([30]);
  const [fontSize, setFontSize] = useState([48]);
  const [rotation, setRotation] = useState([-45]);
  const [processing, setProcessing] = useState(false);

  const handleFilesAccepted = useCallback((files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleAddWatermark = async () => {
    if (!file || !watermarkText.trim()) {
      toast.error("Please add a PDF and enter watermark text");
      return;
    }
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.HelveticaBold);
      const pages = pdf.getPages();
      const alpha = opacity[0] / 100;

      for (const page of pages) {
        const { width, height } = page.getSize();
        const textWidth = font.widthOfTextAtSize(watermarkText, fontSize[0]);
        const x = (width - textWidth) / 2;
        const y = height / 2;

        page.drawText(watermarkText, {
          x,
          y,
          size: fontSize[0],
          font,
          color: rgb(0.5, 0.5, 0.5),
          opacity: alpha,
          rotate: degrees(rotation[0]),
        });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `watermarked_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Watermark added!");
    } catch {
      toast.error("Failed to add watermark");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-primary">
            <Droplets className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Add Watermark</h1>
        </div>
        <p className="text-muted-foreground">Add text watermarks to all pages of your PDF</p>
      </motion.div>

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        accept={{ "application/pdf": [".pdf"] }}
        multiple={false}
        label="Drop a PDF file"
        sublabel="Only PDF files supported"
      />

      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm font-medium text-card-foreground">{file.name}</p>
            <p className="text-xs text-muted-foreground">{(file.size / 1024).toFixed(1)} KB</p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Watermark Text</label>
              <Input value={watermarkText} onChange={(e) => setWatermarkText(e.target.value)} placeholder="Enter watermark text" />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Opacity</label>
                <span className="text-sm font-mono text-muted-foreground">{opacity[0]}%</span>
              </div>
              <Slider value={opacity} onValueChange={setOpacity} min={5} max={100} step={5} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Font Size</label>
                <span className="text-sm font-mono text-muted-foreground">{fontSize[0]}px</span>
              </div>
              <Slider value={fontSize} onValueChange={setFontSize} min={12} max={120} step={4} />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Rotation</label>
                <span className="text-sm font-mono text-muted-foreground">{rotation[0]}°</span>
              </div>
              <Slider value={rotation} onValueChange={setRotation} min={-90} max={90} step={5} />
            </div>
          </div>

          <Button onClick={handleAddWatermark} disabled={processing} className="gradient-primary text-primary-foreground hover:opacity-90 px-8" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {processing ? "Processing..." : "Add Watermark & Download"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PdfWatermarkPage;
