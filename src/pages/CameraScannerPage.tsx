import { useState, useRef, useCallback, useEffect } from "react";
import { motion } from "framer-motion";
import { Camera, Download, Trash2, Plus, RotateCw } from "lucide-react";
import { PDFDocument } from "pdf-lib";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

const CameraScannerPage = () => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captures, setCaptures] = useState<string[]>([]);
  const [cameraActive, setCameraActive] = useState(false);
  const [brightness, setBrightness] = useState([110]);
  const [contrast, setContrast] = useState([120]);
  const [processing, setProcessing] = useState(false);

  const startCamera = async () => {
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } },
      });
      if (videoRef.current) {
        videoRef.current.srcObject = s;
      }
      setStream(s);
      setCameraActive(true);
    } catch {
      toast.error("Camera access denied. Please allow camera permissions.");
    }
  };

  const stopCamera = () => {
    stream?.getTracks().forEach((t) => t.stop());
    setStream(null);
    setCameraActive(false);
  };

  useEffect(() => {
    return () => { stream?.getTracks().forEach((t) => t.stop()); };
  }, [stream]);

  const capture = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.filter = `brightness(${brightness[0]}%) contrast(${contrast[0]}%)`;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.95);
    setCaptures((prev) => [...prev, dataUrl]);
    toast.success("Page captured!");
  };

  const removeCapture = (i: number) => setCaptures((prev) => prev.filter((_, idx) => idx !== i));

  const exportToPdf = async () => {
    if (captures.length === 0) return;
    setProcessing(true);
    try {
      const pdfDoc = await PDFDocument.create();
      for (const dataUrl of captures) {
        const res = await fetch(dataUrl);
        const bytes = await res.arrayBuffer();
        const image = await pdfDoc.embedJpg(bytes);
        const page = pdfDoc.addPage([image.width, image.height]);
        page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
      }
      const pdfBytes = await pdfDoc.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = "scanned_document.pdf";
      a.click();
      URL.revokeObjectURL(a.href);
      toast.success("PDF created from scans!");
    } catch {
      toast.error("Failed to create PDF");
    } finally {
      setProcessing(false);
    }
  };

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-warm">
            <Camera className="w-5 h-5 text-primary-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Camera Scanner</h1>
        </div>
        <p className="text-muted-foreground">Capture documents with your camera and convert to PDF</p>
      </motion.div>

      {!cameraActive ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="flex flex-col items-center justify-center py-16 rounded-2xl border-2 border-dashed border-border bg-card"
        >
          <Camera className="w-12 h-12 text-muted-foreground mb-4" />
          <p className="text-foreground font-medium mb-2">Start scanning documents</p>
          <p className="text-sm text-muted-foreground mb-6">Use your camera to capture pages</p>
          <Button onClick={startCamera} className="gradient-primary text-primary-foreground hover:opacity-90" size="lg">
            <Camera className="w-4 h-4 mr-2" /> Open Camera
          </Button>
        </motion.div>
      ) : (
        <div className="space-y-4">
          <div className="relative rounded-2xl overflow-hidden bg-foreground/5 aspect-video">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-full object-cover"
              style={{ filter: `brightness(${brightness[0]}%) contrast(${contrast[0]}%)` }}
            />
            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-3">
              <Button onClick={capture} size="lg" className="gradient-primary text-primary-foreground shadow-medium rounded-full px-8">
                <Camera className="w-5 h-5 mr-2" /> Capture
              </Button>
              <Button onClick={stopCamera} variant="outline" size="lg" className="rounded-full bg-card/80 backdrop-blur">
                Close
              </Button>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Brightness</label>
                <span className="text-xs font-mono text-muted-foreground">{brightness[0]}%</span>
              </div>
              <Slider value={brightness} onValueChange={setBrightness} min={50} max={200} step={5} />
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <label className="text-sm font-medium text-foreground">Contrast</label>
                <span className="text-xs font-mono text-muted-foreground">{contrast[0]}%</span>
              </div>
              <Slider value={contrast} onValueChange={setContrast} min={50} max={200} step={5} />
            </div>
          </div>
        </div>
      )}

      {captures.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <h3 className="text-sm font-semibold text-foreground">{captures.length} page(s) captured</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {captures.map((cap, i) => (
              <div key={i} className="relative group rounded-xl overflow-hidden border border-border bg-card aspect-[3/4]">
                <img src={cap} alt={`Page ${i + 1}`} className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-foreground/0 group-hover:bg-foreground/40 transition-all flex items-center justify-center">
                  <button onClick={() => removeCapture(i)} className="opacity-0 group-hover:opacity-100 p-2 rounded-lg bg-card/90 text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-card/80 backdrop-blur text-xs font-medium text-card-foreground">
                  Page {i + 1}
                </div>
              </div>
            ))}
          </div>

          <div className="flex gap-3">
            {cameraActive && (
              <Button variant="outline" onClick={capture}>
                <Plus className="w-4 h-4 mr-1.5" /> Add Page
              </Button>
            )}
            <Button onClick={exportToPdf} disabled={processing} className="gradient-warm text-primary-foreground hover:opacity-90" size="lg">
              <Download className="w-4 h-4 mr-2" />
              {processing ? "Creating PDF..." : "Export to PDF"}
            </Button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

export default CameraScannerPage;
