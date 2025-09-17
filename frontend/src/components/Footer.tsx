import { Mail, Phone, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

/**
 * Footer component with official business information for Meta Business verification
 * Contains legal business name, address, contact details as required for verification
 */
export const Footer = () => {
  const navigate = useNavigate();

  return (
    <footer className="bg-muted/30 border-t mt-auto">
      <div className="container mx-auto px-6 py-8">
        <div className="grid gap-6 md:grid-cols-3 text-center md:text-left">
          {/* Business Name & Description */}
          <div>
            <h3 className="font-semibold text-lg mb-2">Namma Pothole</h3>
            <p className="text-sm text-muted-foreground">
              MSME government-registered civic technology service dedicated to
              improving urban road safety and infrastructure.
            </p>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <div className="space-y-1 text-sm text-muted-foreground">
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <Mail className="h-4 w-4" />
                namma.pothole@gmail.com
              </p>
              <p className="flex items-center gap-2 justify-center md:justify-start">
                <Phone className="h-4 w-4" />
                +91 9108420079
              </p>
            </div>
          </div>

          {/* Business Address */}
          <div>
            <h4 className="font-semibold mb-2">Business Address</h4>
            <div className="text-sm text-muted-foreground flex items-start gap-2 justify-center md:justify-start">
              <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
              <div>
                <p>Bengaluru, Karnataka, India</p>
              </div>
            </div>
          </div>
        </div>

        <div className="text-center border-t pt-4 mt-6 space-y-3">
          <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-4 text-sm">
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/privacy")}
            >
              Privacy Policy
            </Button>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/terms")}
            >
              Terms of Service
            </Button>
            <span className="text-muted-foreground hidden sm:inline">•</span>
            <Button
              variant="link"
              size="sm"
              className="h-auto p-0 text-muted-foreground hover:text-foreground"
              onClick={() => navigate("/data-processing")}
            >
              WhatsApp Data Terms
            </Button>
          </div>
          <p className="text-sm text-muted-foreground">
            © 2025 Namma Pothole. All rights reserved. Established August 2025.
          </p>
          <p className="text-xs text-muted-foreground">
            MSME government-registered civic technology service supporting
            municipal infrastructure management.
          </p>
        </div>
      </div>
    </footer>
  );
};
