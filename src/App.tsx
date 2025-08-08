
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import FranchiseForm from "./pages/FranchiseForm";
import BrandingForm from "./pages/BrandingForm";
import FeedbackForm from "./pages/FeedbackForm";
import PhotoSubmissionForm from "./pages/PhotoSubmissionForm";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/franchise-activation-form" element={<FranchiseForm />} />
          <Route path="/branding-form" element={<BrandingForm />} />
          <Route path="/photo-submission" element={<PhotoSubmissionForm />} />
          <Route path="/feedback-form" element={<FeedbackForm/>}/>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
