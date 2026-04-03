import { motion } from "framer-motion";
import {
  FileText,
  Image,
  Minimize2,
  PenTool,
  Scissors,
  Merge,
  RotateCw,
  FileOutput,
  Crop,
  ArrowRightLeft,
  Layers,
  Camera,
  Droplets,
  ScanLine,
  Wand2,
  GraduationCap,
  Clock,
  Bot,
  Sparkles,
} from "lucide-react";
import ToolCard from "@/components/ToolCard";
import FileDropzone from "@/components/FileDropzone";
import { useNavigate } from "react-router-dom";

const toolSections = [
  {
    title: "⚡ AI & Smart Features",
    tools: [
      { title: "Smart Mode", description: "AI auto-detect & process", icon: Wand2, href: "/smart-mode", gradient: "accent" as const },
      { title: "Assignment Mode", description: "Format for submission", icon: GraduationCap, href: "/assignment", gradient: "primary" as const },
      { title: "Time Machine", description: "Track & restore actions", icon: Clock, href: "/history", gradient: "accent" as const },
    ],
  },
  {
    title: "📄 PDF Tools",
    tools: [
      { title: "Merge PDFs", description: "Combine multiple PDFs", icon: Merge, href: "/pdf-tools?tab=merge", gradient: "primary" as const },
      { title: "Split PDF", description: "Extract pages by range", icon: Scissors, href: "/pdf-tools?tab=split", gradient: "primary" as const },
      { title: "Rotate Pages", description: "Fix page orientation", icon: RotateCw, href: "/pdf-tools?tab=rotate", gradient: "primary" as const },
      { title: "Watermark", description: "Add text watermarks", icon: Droplets, href: "/pdf-watermark", gradient: "primary" as const },
      { title: "Page Numbers", description: "Add page numbering", icon: ScanLine, href: "/pdf-page-numbers", gradient: "primary" as const },
    ],
  },
  {
    title: "🖼️ Image Tools",
    tools: [
      { title: "Image → PDF", description: "Convert images to PDF", icon: FileOutput, href: "/image-tools", gradient: "accent" as const },
      { title: "Image Editor", description: "Crop, adjust, filters", icon: Crop, href: "/image-editor", gradient: "accent" as const },
      { title: "Format Converter", description: "JPG ↔ PNG ↔ WebP", icon: ArrowRightLeft, href: "/image-converter", gradient: "accent" as const },
    ],
  },
  {
    title: "🔧 Utilities",
    tools: [
      { title: "Compress", description: "Reduce file sizes", icon: Minimize2, href: "/compress", gradient: "warm" as const },
      { title: "Batch Process", description: "Edit multiple images", icon: Layers, href: "/batch", gradient: "warm" as const },
      { title: "Camera Scanner", description: "Scan docs with camera", icon: Camera, href: "/scanner", gradient: "warm" as const },
      { title: "Signature", description: "Draw & add signatures", icon: PenTool, href: "/signature", gradient: "warm" as const },
    ],
  },
];

const Dashboard = () => {
  const navigate = useNavigate();

  const handleFilesAccepted = (files: File[]) => {
    navigate("/smart-mode", { state: { files } });
  };

  return (
    <div className="space-y-10">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground tracking-tight">
          DocOS <span className="gradient-accent bg-clip-text text-transparent">Ultra</span>
        </h1>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Your intelligent document & media OS. Upload anything, talk to the AI assistant, and get perfect results instantly.
        </p>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Sparkles className="w-4 h-4 text-accent" />
          <span>Tap the ✨ button to open the AI Assistant</span>
        </div>
      </motion.div>

      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1, duration: 0.5 }}>
        <FileDropzone onFilesAccepted={handleFilesAccepted} label="Drop files for Smart Processing" sublabel="AI auto-detects type and suggests the best workflow" />
      </motion.div>

      {toolSections.map((section, sIdx) => (
        <div key={section.title}>
          <h2 className="text-lg font-semibold text-foreground mb-4">{section.title}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {section.tools.map((tool, i) => (
              <ToolCard key={tool.title} {...tool} delay={0.1 + sIdx * 0.05 + i * 0.03} />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default Dashboard;
