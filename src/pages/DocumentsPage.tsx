import { motion } from "framer-motion";
import { FolderOpen, FileText, Search } from "lucide-react";
import { Input } from "@/components/ui/input";

const DocumentsPage = () => {
  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold text-foreground tracking-tight">My Documents</h1>
        <p className="text-muted-foreground mt-1">Your processed documents will appear here</p>
      </motion.div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search documents..." className="pl-10" />
      </div>

      <div className="flex flex-col items-center justify-center py-20 text-center">
        <div className="p-4 rounded-2xl bg-muted mb-4">
          <FolderOpen className="w-10 h-10 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold text-foreground">No documents yet</h3>
        <p className="text-sm text-muted-foreground mt-1 max-w-sm">
          Process files using any tool — your results will be saved here for quick access.
        </p>
      </div>
    </div>
  );
};

export default DocumentsPage;
