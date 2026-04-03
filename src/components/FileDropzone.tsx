import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { motion } from "framer-motion";
import { Upload, FileText, Image } from "lucide-react";

interface FileDropzoneProps {
  onFilesAccepted: (files: File[]) => void;
  accept?: Record<string, string[]>;
  multiple?: boolean;
  label?: string;
  sublabel?: string;
  className?: string;
}

const FileDropzone = ({
  onFilesAccepted,
  accept = {
    "application/pdf": [".pdf"],
    "image/jpeg": [".jpg", ".jpeg"],
    "image/png": [".png"],
    "image/webp": [".webp"],
  },
  multiple = true,
  label = "Drop files here or click to browse",
  sublabel = "Supports PDF, JPG, PNG, WebP",
  className = "",
}: FileDropzoneProps) => {
  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      onFilesAccepted(acceptedFiles);
    },
    [onFilesAccepted]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  const rootProps = getRootProps();

  return (
    <motion.div
      whileHover={{ scale: 1.01 }}
      whileTap={{ scale: 0.99 }}
    >
      <div
        {...rootProps}
        className={`relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed p-10 cursor-pointer transition-all duration-300 ${
          isDragActive
            ? "border-primary bg-primary/5 shadow-glow"
            : "border-border hover:border-primary/40 hover:bg-muted/50"
        } ${className}`}
      >
        <input {...getInputProps()} />
        <motion.div
          animate={isDragActive ? { y: -4, scale: 1.1 } : { y: 0, scale: 1 }}
          transition={{ type: "spring", stiffness: 300 }}
          className="flex items-center gap-2 mb-4"
        >
          <div className="p-3 rounded-xl bg-primary/10">
            <Upload className="w-6 h-6 text-primary" />
          </div>
        </motion.div>
        <p className="text-base font-medium text-foreground">{label}</p>
        <p className="text-sm text-muted-foreground mt-1">{sublabel}</p>
        <div className="flex items-center gap-4 mt-4">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <FileText className="w-3.5 h-3.5" />
            <span>PDF</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <Image className="w-3.5 h-3.5" />
            <span>Images</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

export default FileDropzone;
