import { PrivacyPolicy } from "@/components/PrivacyPolicy";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Privacy = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="container mx-auto p-6">
        {/* Back to Dashboard Button */}
        <div className="mb-6">
          <Button
            variant="outline"
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
        
        {/* Privacy Policy Content */}
        <PrivacyPolicy />
      </div>
      
      {/* Footer */}
      <Footer />
    </div>
  );
};

export default Privacy;
