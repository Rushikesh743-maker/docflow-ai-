import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VersionProvider } from "@/contexts/VersionContext";
import AppLayout from "@/components/AppLayout";
import AIChatPanel from "@/components/AIChatPanel";
import Dashboard from "@/pages/Dashboard";
import PdfTools from "@/pages/PdfTools";
import PdfWatermarkPage from "@/pages/PdfWatermarkPage";
import PdfPageNumbersPage from "@/pages/PdfPageNumbersPage";
import ImageTools from "@/pages/ImageTools";
import ImageEditorPage from "@/pages/ImageEditorPage";
import ImageConverterPage from "@/pages/ImageConverterPage";
import CompressPage from "@/pages/CompressPage";
import BatchProcessingPage from "@/pages/BatchProcessingPage";
import CameraScannerPage from "@/pages/CameraScannerPage";
import SmartMode from "@/pages/SmartMode";
import SignaturePage from "@/pages/SignaturePage";
import AssignmentPage from "@/pages/AssignmentPage";
import VersionHistoryPage from "@/pages/VersionHistoryPage";
import DocumentsPage from "@/pages/DocumentsPage";
import NotFound from "./pages/NotFound.tsx";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <VersionProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppLayout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/pdf-tools" element={<PdfTools />} />
              <Route path="/pdf-watermark" element={<PdfWatermarkPage />} />
              <Route path="/pdf-page-numbers" element={<PdfPageNumbersPage />} />
              <Route path="/image-tools" element={<ImageTools />} />
              <Route path="/image-editor" element={<ImageEditorPage />} />
              <Route path="/image-converter" element={<ImageConverterPage />} />
              <Route path="/compress" element={<CompressPage />} />
              <Route path="/batch" element={<BatchProcessingPage />} />
              <Route path="/scanner" element={<CameraScannerPage />} />
              <Route path="/smart-mode" element={<SmartMode />} />
              <Route path="/signature" element={<SignaturePage />} />
              <Route path="/assignment" element={<AssignmentPage />} />
              <Route path="/history" element={<VersionHistoryPage />} />
              <Route path="/documents" element={<DocumentsPage />} />
              <Route path="*" element={<NotFound />} />
            </Routes>
          </AppLayout>
          <AIChatPanel />
        </BrowserRouter>
      </VersionProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
