import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { ScanLine, Download } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type Position = "bottom-center" | "bottom-left" | "bottom-right" | "top-center";

const positions: { id: Position; label: string }[] = [
  { id: "bottom-center", label: "Bottom Center" },
  { id: "bottom-left", label: "Bottom Left" },
  { id: "bottom-right", label: "Bottom Right" },
  { id: "top-center", label: "Top Center" },
];

const PdfPageNumbersPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [fontSize, setFontSize] = useState([12]);
  const [startFrom, setStartFrom] = useState(1);
  const [processing, setProcessing] = useState(false);

  const handleFilesAccepted = useCallback((files: File[]) => {
    setFile(files[0]);
  }, []);

  const handleAddPageNumbers = async () => {
    if (!file) return;
    setProcessing(true);
    try {
      const bytes = await file.arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const num = `${i + startFrom}`;
        const textWidth = font.widthOfTextAtSize(num, fontSize[0]);
        let x: number, y: number;

        switch (position) {
          case "bottom-center":
            x = (width - textWidth) / 2;
            y = 30;
            break;
          case "bottom-left":
            x = 40;
            y = 30;
            break;
          case "bottom-right":
            x = width - textWidth - 40;
            y = 30;
            break;
          case "top-center":
            x = (width - textWidth) / 2;
            y = height - 40;
            break;
        }

        page.drawText(num, {
          x,
          y,
          size: fontSize[0],
          font,
          color: rgb(0.3, 0.3, 0.3),
        });
      });

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `numbered_${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      toast.success("Page numbers added!");
    } catch {
      toast.error("Failed to add page numbers");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-primary">
            <ScanLine className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Add Page Numbers</h1>
        </div>
        <p className="text-muted-foreground">Add page numbers to your PDF document</p>
      </motion.div>

      <FileDropzone onFilesAccepted={handleFilesAccepted} accept={{ "application/pdf": [".pdf"] }} multiple={false} label="Drop a PDF file" sublabel="Only PDF files supported" />

      {file && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
          <div className="p-4 rounded-xl bg-card border border-border">
            <p className="text-sm font-medium text-card-foreground">{file.name}</p>
          </div>

          <div className="space-y-3">
            <label className="text-sm font-medium text-foreground">Position</label>
            <div className="flex flex-wrap gap-2">
              {positions.map((pos) => (
                <button
                  key={pos.id}
                  onClick={() => setPosition(pos.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    position === pos.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {pos.label}
                </button>
              ))}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Font Size</label>
                <span className="text-sm font-mono text-muted-foreground">{fontSize[0]}px</span>
              </div>
              <Slider value={fontSize} onValueChange={setFontSize} min={8} max={24} step={1} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-foreground">Start From</label>
              <input
                type="number"
                value={startFrom}
                onChange={(e) => setStartFrom(parseInt(e.target.value) || 1)}
                min={1}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              />
            </div>
          </div>

          <Button onClick={handleAddPageNumbers} disabled={processing} className="gradient-primary text-primary-foreground hover:opacity-90 px-8" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {processing ? "Processing..." : "Add Numbers & Download"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default PdfPageNumbersPage;
