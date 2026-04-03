import { useState, useCallback, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Crop,
  RotateCw,
  FlipHorizontal,
  FlipVertical,
  Sun,
  Contrast,
  Download,
  Undo,
  Palette,
} from "lucide-react";
import FileDropzone from "@/components/FileDropzone";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { toast } from "sonner";

type FilterPreset = {
  name: string;
  filter: string;
};

const presets: FilterPreset[] = [
  { name: "Original", filter: "none" },
  { name: "B&W", filter: "grayscale(100%)" },
  { name: "Sepia", filter: "sepia(80%)" },
  { name: "Vintage", filter: "sepia(40%) contrast(90%) brightness(110%)" },
  { name: "Vivid", filter: "saturate(150%) contrast(110%)" },
  { name: "Cool", filter: "hue-rotate(30deg) saturate(120%)" },
  { name: "Warm", filter: "hue-rotate(-15deg) saturate(130%) brightness(105%)" },
  { name: "Dramatic", filter: "contrast(140%) brightness(90%)" },
];

const ImageEditorPage = () => {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string>("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);

  const [brightness, setBrightness] = useState([100]);
  const [contrast, setContrast] = useState([100]);
  const [saturation, setSaturation] = useState([100]);
  const [sharpness, setSharpness] = useState([0]);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [activePreset, setActivePreset] = useState("Original");
  const [activeTab, setActiveTab] = useState<"adjust" | "filters" | "transform">("adjust");

  const handleFilesAccepted = useCallback((files: File[]) => {
    setFile(files[0]);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target?.result as string);
    reader.readAsDataURL(files[0]);
    resetAll();
  }, []);

  const resetAll = () => {
    setBrightness([100]);
    setContrast([100]);
    setSaturation([100]);
    setSharpness([0]);
    setRotation(0);
    setFlipH(false);
    setFlipV(false);
    setActivePreset("Original");
  };

  const getCssFilter = () => {
    if (activePreset !== "Original") {
      const preset = presets.find((p) => p.name === activePreset);
      return preset?.filter || "none";
    }
    return `brightness(${brightness[0]}%) contrast(${contrast[0]}%) saturate(${saturation[0]}%)`;
  };

  const getTransform = () => {
    const parts: string[] = [];
    if (rotation) parts.push(`rotate(${rotation}deg)`);
    if (flipH) parts.push("scaleX(-1)");
    if (flipV) parts.push("scaleY(-1)");
    return parts.length > 0 ? parts.join(" ") : "none";
  };

  const handleDownload = () => {
    if (!preview) return;
    const img = new window.Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      const isRotated90 = rotation === 90 || rotation === 270;
      canvas.width = isRotated90 ? img.height : img.width;
      canvas.height = isRotated90 ? img.width : img.height;
      const ctx = canvas.getContext("2d")!;

      ctx.filter = getCssFilter();
      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `edited_${file?.name || "image.png"}`;
        a.click();
        URL.revokeObjectURL(url);
        toast.success("Image downloaded!");
      }, "image/png");
    };
    img.src = preview;
  };

  const tabs = [
    { id: "adjust" as const, label: "Adjust", icon: Sun },
    { id: "filters" as const, label: "Filters", icon: Palette },
    { id: "transform" as const, label: "Transform", icon: RotateCw },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2 rounded-xl gradient-accent">
            <Crop className="w-5 h-5 text-accent-foreground" />
          </div>
          <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">Image Editor</h1>
        </div>
        <p className="text-muted-foreground">Edit, enhance, and transform your images</p>
      </motion.div>

      {!preview ? (
        <FileDropzone
          onFilesAccepted={handleFilesAccepted}
          accept={{ "image/jpeg": [".jpg", ".jpeg"], "image/png": [".png"], "image/webp": [".webp"] }}
          multiple={false}
          label="Drop an image to edit"
          sublabel="Supports JPG, PNG, WebP"
        />
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
          {/* Preview */}
          <div className="rounded-2xl border border-border bg-card overflow-hidden flex items-center justify-center min-h-[400px] p-4">
            <img
              src={preview}
              alt="Preview"
              className="max-w-full max-h-[500px] object-contain rounded-lg transition-all duration-300"
              style={{ filter: getCssFilter(), transform: getTransform() }}
            />
          </div>

          {/* Controls */}
          <div className="space-y-4">
            <div className="flex gap-1 p-1 rounded-xl bg-muted">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === tab.id ? "bg-card text-foreground shadow-soft" : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  <tab.icon className="w-3.5 h-3.5" />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === "adjust" && (
              <div className="space-y-5 p-4 rounded-xl bg-card border border-border">
                {[
                  { label: "Brightness", value: brightness, set: setBrightness, icon: Sun, min: 0, max: 200 },
                  { label: "Contrast", value: contrast, set: setContrast, icon: Contrast, min: 0, max: 200 },
                  { label: "Saturation", value: saturation, set: setSaturation, icon: Palette, min: 0, max: 200 },
                ].map((ctrl) => (
                  <div key={ctrl.label} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="text-sm font-medium text-foreground flex items-center gap-2">
                        <ctrl.icon className="w-3.5 h-3.5 text-muted-foreground" />
                        {ctrl.label}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">{ctrl.value[0]}%</span>
                    </div>
                    <Slider value={ctrl.value} onValueChange={(v) => { ctrl.set(v); setActivePreset("Original"); }} min={ctrl.min} max={ctrl.max} step={1} />
                  </div>
                ))}
              </div>
            )}

            {activeTab === "filters" && (
              <div className="grid grid-cols-2 gap-2 p-4 rounded-xl bg-card border border-border">
                {presets.map((preset) => (
                  <button
                    key={preset.name}
                    onClick={() => setActivePreset(preset.name)}
                    className={`px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                      activePreset === preset.name ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {preset.name}
                  </button>
                ))}
              </div>
            )}

            {activeTab === "transform" && (
              <div className="space-y-4 p-4 rounded-xl bg-card border border-border">
                <div className="grid grid-cols-2 gap-2">
                  <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 90) % 360)}>
                    <RotateCw className="w-4 h-4 mr-1.5" /> Rotate 90°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setRotation((r) => (r + 180) % 360)}>
                    <RotateCw className="w-4 h-4 mr-1.5" /> Rotate 180°
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFlipH(!flipH)} className={flipH ? "ring-2 ring-primary" : ""}>
                    <FlipHorizontal className="w-4 h-4 mr-1.5" /> Flip H
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setFlipV(!flipV)} className={flipV ? "ring-2 ring-primary" : ""}>
                    <FlipVertical className="w-4 h-4 mr-1.5" /> Flip V
                  </Button>
                </div>
              </div>
            )}

            <div className="flex gap-2">
              <Button variant="outline" onClick={resetAll} className="flex-1">
                <Undo className="w-4 h-4 mr-1.5" /> Reset
              </Button>
              <Button onClick={handleDownload} className="flex-1 gradient-primary text-primary-foreground hover:opacity-90">
                <Download className="w-4 h-4 mr-1.5" /> Save
              </Button>
            </div>

            <Button
              variant="ghost"
              className="w-full text-muted-foreground"
              onClick={() => { setPreview(""); setFile(null); resetAll(); }}
            >
              Change Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ImageEditorPage;
