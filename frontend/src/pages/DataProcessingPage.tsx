import { WhatsAppDataProcessingTerms } from "@/components/WhatsAppDataProcessingTerms";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Home } from "lucide-react";
import { useNavigate } from "react-router-dom";

const DataProcessingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="container mx-auto p-6">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back to Dashboard</span>
              <span className="sm:hidden">Back</span>
            </Button>
            <Button
              variant="ghost"
              onClick={() => navigate('/')}
              className="flex items-center gap-2"
            >
              <Home className="h-4 w-4" />
              <span className="hidden sm:inline">Home</span>
            </Button>
          </div>
        </div>
        
        {/* WhatsApp Data Processing Terms Content */}
        <WhatsAppDataProcessingTerms />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default DataProcessingPage;
