import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Building,
  Globe,
  Users,
} from "lucide-react";

/**
 * Contact page component with complete business information
 * Contains all details required for Meta Business verification
 */
export const Contact = () => {
  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, "_self");
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, "_self");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">
          Contact Namma Pothole
        </h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Get in touch with us for support, partnerships, feedback, or any
          queries about our civic technology services.
        </p>
      </div>

      <Separator />

      {/* Contact Information Cards */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Email Contact */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <Mail className="h-8 w-8 text-blue-600" />
            </div>
            <CardTitle>Email Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              For support, partnerships, and feedback
            </p>
            <Button
              onClick={() => sendEmail("namma.pothole@gmail.com")}
              className="w-full"
            >
              <Mail className="h-4 w-4 mr-2" />
              namma.pothole@gmail.com
            </Button>
          </CardContent>
        </Card>

        {/* Phone Contact */}
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <Phone className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle>Call Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              For urgent matters and technical assistance
            </p>
            <Button
              onClick={() => makeCall("+919611379776")}
              variant="outline"
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              +91 9611379776
            </Button>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Business Information */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Business Information
          </h2>
          <p className="text-muted-foreground">
            Official details for Meta Business verification and legal compliance
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2">
          {/* Legal Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building className="h-5 w-5" />
                Legal Business Details
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  LEGAL BUSINESS NAME
                </h4>
                <p className="font-medium">Namma Pothole</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  BUSINESS TYPE
                </h4>
                <p>MSME government-registered civic technology service</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  REGISTRATION STATUS
                </h4>
                <p>MSME government-registered organization</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  BUSINESS CATEGORY
                </h4>
                <p>Civic Technology & Urban Infrastructure</p>
              </div>
            </CardContent>
          </Card>

          {/* Service Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="h-5 w-5" />
                Services & Operations
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  PRIMARY SERVICE
                </h4>
                <p>Urban road safety and infrastructure reporting platform</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  TARGET AUDIENCE
                </h4>
                <p>Citizens, municipal authorities, and government agencies</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  OPERATIONAL AREA
                </h4>
                <p>Bengaluru, Karnataka, India</p>
              </div>

              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">
                  BUSINESS HOURS
                </h4>
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4" />
                  <span>24/7 Digital Service Platform</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />
    </div>
  );
};
