import { useState, useCallback, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { PDFDocument } from "pdf-lib";
import {
  Zap,
  FileText,
  Image,
  ArrowRight,
  Check,
  Download,
  Loader2,
  Sparkles,
} from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface DetectedFile {
  file: File;
  type: "pdf" | "image";
  suggestedSteps: string[];
}

const SmartMode = () => {
  const location = useLocation();
  const [files, setFiles] = useState<DetectedFile[]>([]);
  const [processing, setProcessing] = useState(false);
  const [currentStep, setCurrentStep] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const detectFile = (file: File): DetectedFile => {
    const isImage = file.type.startsWith("image/");
    const isPdf = file.type === "application/pdf";

    const steps: string[] = [];
    if (isImage) {
      steps.push("Convert to PDF", "Optimize quality", "Auto-rename");
    } else if (isPdf) {
      steps.push("Analyze document", "Compress", "Auto-rename");
    }
    if (files.length > 0 || (!isImage && !isPdf)) {
      steps.push("Merge into single PDF");
    }

    return {
      file,
      type: isImage ? "image" : "pdf",
      suggestedSteps: steps.length > 0 ? steps : ["Process file"],
    };
  };

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    const detected = newFiles.map(detectFile);
    setFiles((prev) => [...prev, ...detected]);
    setDone(false);
  }, [files.length]);

  // Handle files passed from dashboard
  useEffect(() => {
    const state = location.state as { files?: File[] } | null;
    if (state?.files) {
      const detected = state.files.map(detectFile);
      setFiles(detected);
    }
  }, []);

  const downloadBlob = (blob: Blob, filename: string) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleProcessAll = async () => {
    if (files.length === 0) return;
    setProcessing(true);
    setDone(false);

    try {
      const pdfDoc = await PDFDocument.create();

      for (const detected of files) {
        if (detected.type === "image") {
          setCurrentStep(`Converting ${detected.file.name}...`);
          const bytes = await detected.file.arrayBuffer();
          let image;
          if (detected.file.type === "image/png") {
            image = await pdfDoc.embedPng(bytes);
          } else {
            image = await pdfDoc.embedJpg(bytes);
          }
          const page = pdfDoc.addPage([image.width, image.height]);
          page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
        } else {
          setCurrentStep(`Processing ${detected.file.name}...`);
          const bytes = await detected.file.arrayBuffer();
          const existingPdf = await PDFDocument.load(bytes);
          const pages = await pdfDoc.copyPages(existingPdf, existingPdf.getPageIndices());
          pages.forEach((page) => pdfDoc.addPage(page));
        }
        // Small delay for visual feedback
        await new Promise((r) => setTimeout(r, 300));
      }

      setCurrentStep("Finalizing document...");
      const pdfBytes = await pdfDoc.save();
      downloadBlob(
        new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" }),
        "DocOS_Output.pdf"
      );

      setDone(true);
      setCurrentStep(null);
      toast.success("All files processed and merged!");
    } catch (e) {
      toast.error("Processing failed");
      setCurrentStep(null);
    } finally {
      setProcessing(false);
    }
  };

  const allSteps = files.flatMap((f) => f.suggestedSteps);

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-accent">
            <Zap className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">
            Smart Mode
          </h1>
        </div>
        <p className="text-muted-foreground">
          Upload anything — DocOS automatically detects file types and processes them into a clean, optimized document.
        </p>
      </motion.div>

      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        label="Drop any files for smart processing"
        sublabel="Images and PDFs — we'll figure out the rest"
      />

      {/* Detected Files */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-accent" />
              Detected {files.length} file{files.length > 1 ? "s" : ""}
            </h3>

            {files.map((detected, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="p-4 rounded-xl bg-card border border-border"
              >
                <div className="flex items-center gap-3 mb-3">
                  {detected.type === "image" ? (
                    <Image className="w-5 h-5 text-accent" />
                  ) : (
                    <FileText className="w-5 h-5 text-primary" />
                  )}
                  <div>
                    <p className="text-sm font-medium text-card-foreground">{detected.file.name}</p>
                    <p className="text-xs text-muted-foreground capitalize">{detected.type} detected</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {detected.suggestedSteps.map((step, j) => (
                    <span
                      key={j}
                      className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-muted text-xs font-medium text-muted-foreground"
                    >
                      {j > 0 && <ArrowRight className="w-3 h-3" />}
                      {step}
                    </span>
                  ))}
                </div>
              </motion.div>
            ))}

            {/* Process button */}
            <div className="pt-2">
              <Button
                onClick={handleProcessAll}
                disabled={processing}
                size="lg"
                className="gradient-accent text-accent-foreground hover:opacity-90 px-8 w-full sm:w-auto"
              >
                {processing ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {currentStep || "Processing..."}
                  </>
                ) : done ? (
                  <>
                    <Check className="w-4 h-4 mr-2" />
                    Done! Process Again
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4 mr-2" />
                    Process All ({files.length} files)
                  </>
                )}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default SmartMode;
