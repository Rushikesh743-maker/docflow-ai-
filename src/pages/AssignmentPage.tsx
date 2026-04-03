import { useState, useCallback } from "react";
import { motion } from "framer-motion";
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { GraduationCap, Download, FileText } from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const targets = [
  { id: "college", label: "College Portal", maxSize: "5MB", format: "PDF" },
  { id: "email", label: "Email", maxSize: "2MB", format: "PDF" },
  { id: "whatsapp", label: "WhatsApp", maxSize: "1MB", format: "PDF" },
];

const AssignmentPage = () => {
  const [files, setFiles] = useState<File[]>([]);
  const [title, setTitle] = useState("");
  const [subject, setSubject] = useState("");
  const [studentName, setStudentName] = useState("");
  const [rollNo, setRollNo] = useState("");
  const [target, setTarget] = useState("college");
  const [addCover, setAddCover] = useState(true);
  const [addPageNums, setAddPageNums] = useState(true);
  const [processing, setProcessing] = useState(false);

  const handleFilesAccepted = useCallback((newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
  }, []);

  const buildAssignment = async () => {
    if (files.length === 0) {
      toast.error("Please add at least one file");
      return;
    }
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      const font = await pdfDoc.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

      // Cover page
      if (addCover && (title || subject)) {
        const coverPage = pdfDoc.addPage([595, 842]); // A4
        const { width, height } = coverPage.getSize();

        if (title) {
          const titleSize = 28;
          const titleWidth = boldFont.widthOfTextAtSize(title, titleSize);
          coverPage.drawText(title, {
            x: (width - titleWidth) / 2,
            y: height - 280,
            size: titleSize,
            font: boldFont,
            color: rgb(0.1, 0.1, 0.1),
          });
        }

        if (subject) {
          const subSize = 18;
          const subWidth = font.widthOfTextAtSize(subject, subSize);
          coverPage.drawText(subject, {
            x: (width - subWidth) / 2,
            y: height - 330,
            size: subSize,
            font,
            color: rgb(0.3, 0.3, 0.3),
          });
        }

        const details = [
          studentName && `Name: ${studentName}`,
          rollNo && `Roll No: ${rollNo}`,
        ].filter(Boolean);

        details.forEach((detail, i) => {
          if (detail) {
            const dWidth = font.widthOfTextAtSize(detail, 14);
            coverPage.drawText(detail, {
              x: (width - dWidth) / 2,
              y: height - 420 - i * 30,
              size: 14,
              font,
              color: rgb(0.2, 0.2, 0.2),
            });
          }
        });
      }

      // Add content pages
      for (const file of files) {
        const bytes = await file.arrayBuffer();
        if (file.type === "application/pdf") {
          const existingPdf = await PDFDocument.load(bytes);
          const pages = await pdfDoc.copyPages(existingPdf, existingPdf.getPageIndices());
          pages.forEach((p) => pdfDoc.addPage(p));
        } else if (file.type.startsWith("image/")) {
          let image;
          if (file.type === "image/png") {
            image = await pdfDoc.embedPng(bytes);
          } else {
            image = await pdfDoc.embedJpg(bytes);
          }
          const page = pdfDoc.addPage([595, 842]);
          const { width: pw, height: ph } = page.getSize();
          const scale = Math.min((pw - 60) / image.width, (ph - 80) / image.height);
          const iw = image.width * scale;
          const ih = image.height * scale;
          page.drawImage(image, { x: (pw - iw) / 2, y: (ph - ih) / 2, width: iw, height: ih });
        }
      }

      // Add page numbers
      if (addPageNums) {
        const pages = pdfDoc.getPages();
        const startIdx = addCover ? 1 : 0;
        for (let i = startIdx; i < pages.length; i++) {
          const page = pages[i];
          const { width } = page.getSize();
          const num = `${i - startIdx + 1}`;
          const numWidth = font.widthOfTextAtSize(num, 10);
          page.drawText(num, { x: (width - numWidth) / 2, y: 25, size: 10, font, color: rgb(0.4, 0.4, 0.4) });
        }
      }

      const pdfBytes = await pdfDoc.save();
      const fileName = title ? `${title.replace(/\s+/g, "_")}.pdf` : "assignment.pdf";
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("Assignment ready for submission!");
    } catch {
      toast.error("Failed to build assignment");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-primary">
            <GraduationCap className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Assignment Mode</h1>
        </div>
        <p className="text-muted-foreground">Format and prepare assignments for submission with cover page, page numbers, and auto-formatting</p>
      </motion.div>

      {/* Target */}
      <div className="space-y-3">
        <label className="text-sm font-medium text-foreground">Submission Target</label>
        <div className="grid grid-cols-3 gap-2">
          {targets.map((t) => (
            <button
              key={t.id}
              onClick={() => setTarget(t.id)}
              className={`p-3 rounded-xl border text-center transition-all ${
                target === t.id ? "border-primary bg-primary/5 shadow-glow" : "border-border bg-card hover:border-primary/30"
              }`}
            >
              <p className={`text-sm font-semibold ${target === t.id ? "text-primary" : "text-card-foreground"}`}>{t.label}</p>
              <p className="text-xs text-muted-foreground mt-0.5">Max {t.maxSize}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Assignment Title</label>
          <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g., Physics Lab Report" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Subject</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} placeholder="e.g., Physics" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Student Name</label>
          <Input value={studentName} onChange={(e) => setStudentName(e.target.value)} placeholder="Your name" />
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium text-foreground">Roll Number</label>
          <Input value={rollNo} onChange={(e) => setRollNo(e.target.value)} placeholder="e.g., 2024CS101" />
        </div>
      </div>

      {/* Options */}
      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={addCover} onChange={(e) => setAddCover(e.target.checked)} className="rounded border-input" />
          <span className="text-sm text-foreground">Add cover page</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="checkbox" checked={addPageNums} onChange={(e) => setAddPageNums(e.target.checked)} className="rounded border-input" />
          <span className="text-sm text-foreground">Add page numbers</span>
        </label>
      </div>

      {/* Upload */}
      <FileDropzone
        onFilesAccepted={handleFilesAccepted}
        label="Drop your assignment pages"
        sublabel="PDFs and images — they'll be combined in order"
      />

      {files.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <h3 className="text-sm font-medium text-foreground">{files.length} file(s) added</h3>
          {files.map((f, i) => (
            <div key={`${f.name}-${i}`} className="flex items-center gap-3 p-3 rounded-xl bg-card border border-border">
              <FileText className="w-4 h-4 text-primary flex-shrink-0" />
              <span className="flex-1 text-sm text-card-foreground truncate">{f.name}</span>
              <button onClick={() => setFiles((prev) => prev.filter((_, idx) => idx !== i))} className="text-xs text-muted-foreground hover:text-destructive">Remove</button>
            </div>
          ))}

          <Button onClick={buildAssignment} disabled={processing} className="gradient-primary text-primary-foreground hover:opacity-90 px-8 w-full sm:w-auto" size="lg">
            <Download className="w-4 h-4 mr-2" />
            {processing ? "Building..." : "Build & Download Assignment"}
          </Button>
        </motion.div>
      )}
    </div>
  );
};

export default AssignmentPage;
