import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { useSearchParams } from "react-router-dom";
import { PDFDocument, degrees } from "pdf-lib";
import { Merge, Scissors, RotateCw, Download, Trash2, GripVertical, FileText } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";

type Tab = "merge" | "split" | "rotate";

const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: "merge", label: "Merge", icon: Merge },
  { id: "split", label: "Split", icon: Scissors },
  { id: "rotate", label: "Rotate", icon: RotateCw },
];

const PdfTools = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = (searchParams.get("tab") as Tab) || "merge";
  const [files, setFiles] = useState<File[]>([]);
  const [processing, setProcessing] = useState(false);
  const [splitRange, setSplitRange] = useState("1-3");
  const [rotationAngle, setRotationAngle] = useState(90);

  const setTab = (tab: Tab) => setSearchParams({ tab });

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (from: number, to: number) => {
    setFiles((prev) => {
      const next = [...prev];
      const [item] = next.splice(from, 1);
      next.splice(to, 0, item);
      return next;
    });
  };

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleMerge = async () => {
    if (files.length < 2) {
      toast.error("Please add at least 2 PDF files to merge");
      return;
    }
    setProcessing(true);
    try {
      const mergedPdf = await PDFDocument.create();
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        const pdf = await PDFDocument.load(bytes);
        const pages = await mergedPdf.copyPages(pdf, pdf.getPageIndices());
        pages.forEach((page) => mergedPdf.addPage(page));
      }
      const mergedBytes = await mergedPdf.save();
      downloadBlob(new Blob([mergedBytes as unknown as BlobPart], { type: "application/pdf" }), "merged.pdf");
      toast.success("PDFs merged successfully!");
    } catch (e) {
      toast.error("Failed to merge PDFs");
    } finally {
      setProcessing(false);
    }
  };

  const handleSplit = async () => {
    if (files.length !== 1) {
      toast.error("Please add exactly 1 PDF file to split");
      return;
    }
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      const totalPages = pdf.getPageCount();

      // Parse range like "1-3" or "1,3,5"
      const pageIndices: number[] = [];
      splitRange.split(",").forEach((part) => {
        const trimmed = part.trim();
        if (trimmed.includes("-")) {
          const [start, end] = trimmed.split("-").map(Number);
          for (let i = start; i <= Math.min(end, totalPages); i++) {
            pageIndices.push(i - 1);
          }
        } else {
          const n = parseInt(trimmed);
          if (n >= 1 && n <= totalPages) pageIndices.push(n - 1);
        }
      });

      if (pageIndices.length === 0) {
        toast.error("Invalid page range");
        return;
      }

      const newPdf = await PDFDocument.create();
      const pages = await newPdf.copyPages(pdf, pageIndices);
      pages.forEach((page) => newPdf.addPage(page));
      const newBytes = await newPdf.save();
      downloadBlob(new Blob([newBytes as unknown as BlobPart], { type: "application/pdf" }), "split.pdf");
      toast.success(`Extracted ${pageIndices.length} pages!`);
    } catch (e) {
      toast.error("Failed to split PDF");
    } finally {
      setProcessing(false);
    }
  };

  const handleRotate = async () => {
    if (files.length !== 1) {
      toast.error("Please add exactly 1 PDF file");
      return;
    }
    setProcessing(true);
    try {
      const bytes = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(bytes);
      pdf.getPages().forEach((page) => page.setRotation(degrees(rotationAngle)));
      const newBytes = await pdf.save();
      downloadBlob(new Blob([newBytes as unknown as BlobPart], { type: "application/pdf" }), "rotated.pdf");
      toast.success("PDF rotated successfully!");
    } catch (e) {
      toast.error("Failed to rotate PDF");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">PDF Tools</h1>
        <p className="text-muted-foreground mt-1">Merge, split, and rotate your PDF documents</p>
      </motion.div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-xl bg-muted w-fit">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setTab(tab.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-card text-foreground shadow-soft"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Upload */}
      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        accept={{ "application/pdf": [".pdf"] }}
        label="Drop PDF files here"
        sublabel="Only PDF files supported"
      />

      {/* File List */}
      {files.length > 0 && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="space-y-2"
        >
          <h3 className="text-sm font-medium text-foreground">
            {files.length} file{files.length > 1 ? "s" : ""} selected
          </h3>
          {files.map((file, i) => (
            <div
              key={`${file.name}-${i}`}
              className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border"
            >
              {activeTab === "merge" && (
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => i > 0 && moveFile(i, i - 1)}
                    disabled={i === 0}
                    className="text-muted-foreground hover:text-foreground disabled:opacity-30"
                  >
                    <GripVertical className="w-4 h-4" />
                  </button>
                </div>
              )}
              <FileText className="w-5 h-5 text-primary flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-card-foreground truncate">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  {(file.size / 1024).toFixed(1)} KB
                </p>
              </div>
              <button
                onClick={() => removeFile(i)}
                className="p-1.5 rounded-lg hover:bg-destructive/10 text-muted-foreground hover:text-destructive transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))}
        </motion.div>
      )}

      {/* Tab-specific controls */}
      {activeTab === "split" && files.length === 1 && (
        <div className="space-y-3">
          <label className="text-sm font-medium text-foreground">Page Range</label>
          <Input
            value={splitRange}
            onChange={(e) => setSplitRange(e.target.value)}
            placeholder="e.g., 1-3 or 1,3,5"
            className="max-w-xs"
          />
          <p className="text-xs text-muted-foreground">Use ranges (1-3) or comma-separated (1,3,5)</p>
        </div>
      )}

      {activeTab === "rotate" && files.length === 1 && (
        <div className="flex gap-2">
          {[90, 180, 270].map((angle) => (
            <button
              key={angle}
              onClick={() => setRotationAngle(angle)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                rotationAngle === angle
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground hover:text-foreground"
              }`}
            >
              {angle}°
            </button>
          ))}
        </div>
      )}

      {/* Action Button */}
      {files.length > 0 && (
        <Button
          onClick={
            activeTab === "merge"
              ? handleMerge
              : activeTab === "split"
              ? handleSplit
              : handleRotate
          }
          disabled={processing}
          className="gradient-primary text-primary-foreground hover:opacity-90 px-8"
          size="lg"
        >
          <Download className="w-4 h-4 mr-2" />
          {processing
            ? "Processing..."
            : activeTab === "merge"
            ? "Merge & Download"
            : activeTab === "split"
            ? "Extract & Download"
            : "Rotate & Download"}
        </Button>
      )}
    </div>
  );
};

export default PdfTools;
