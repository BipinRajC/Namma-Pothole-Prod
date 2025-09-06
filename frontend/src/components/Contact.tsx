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
  Users
} from "lucide-react";

/**
 * Contact page component with complete business information
 * Contains all details required for Meta Business verification
 */
export const Contact = () => {
  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  const makeCall = (phone: string) => {
    window.open(`tel:${phone}`, '_self');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-foreground">Contact Namma Pothole</h1>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Get in touch with us for support, partnerships, feedback, or any queries about our civic technology services.
        </p>
      </div>

      <Separator />

      {/* Contact Information Cards */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
              onClick={() => sendEmail('namma.pothole@gmail.com')}
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
              onClick={() => makeCall('+917676795199')}
              variant="outline"
              className="w-full"
            >
              <Phone className="h-4 w-4 mr-2" />
              +91 7676795199
            </Button>
          </CardContent>
        </Card>

        {/* Office Location */}
        <Card className="hover:shadow-lg transition-shadow md:col-span-2 lg:col-span-1">
          <CardHeader className="text-center">
            <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full mx-auto flex items-center justify-center mb-4">
              <MapPin className="h-8 w-8 text-red-600" />
            </div>
            <CardTitle>Visit Us</CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <p className="text-muted-foreground">
              Our business address
            </p>
            <div className="text-sm">
              <p>11, Lake City Layout</p>
              <p>6th cross road, Kodichikkanahalli</p>
              <p>Behind Janapriya Apts Phase2</p>
              <p>Bengaluru, Karnataka, India</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Business Information */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Business Information</h2>
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
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">LEGAL BUSINESS NAME</h4>
                <p className="font-medium">Namma Pothole</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">BUSINESS TYPE</h4>
                <p>Government-registered civic technology service</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">REGISTRATION STATUS</h4>
                <p>Government-registered organization</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">BUSINESS CATEGORY</h4>
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
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">PRIMARY SERVICE</h4>
                <p>Urban road safety and infrastructure reporting platform</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">TARGET AUDIENCE</h4>
                <p>Citizens, municipal authorities, and government agencies</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">OPERATIONAL AREA</h4>
                <p>Bengaluru, Karnataka, India</p>
              </div>
              
              <div>
                <h4 className="font-semibold text-sm text-muted-foreground mb-1">BUSINESS HOURS</h4>
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

      {/* Contact Form Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Get In Touch</h2>
          <p className="text-muted-foreground">
            We're here to help you report road issues and improve urban infrastructure
          </p>
        </div>

        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-8">
            <div className="space-y-6">
              <div className="text-center">
                <Users className="h-12 w-12 mx-auto text-primary mb-4" />
                <h3 className="text-xl font-semibold mb-2">Multiple Ways to Reach Us</h3>
                <p className="text-muted-foreground mb-6">
                  Choose the most convenient method to contact our team
                </p>
              </div>
              
              <div className="grid gap-4 sm:grid-cols-2">
                <Button
                  onClick={() => sendEmail('namma.pothole@gmail.com')}
                  className="h-12"
                >
                  <Mail className="h-4 w-4 mr-2" />
                  Send Email
                </Button>
                
                <Button
                  onClick={() => makeCall('+917676795199')}
                  variant="outline"
                  className="h-12"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  Call Now
                </Button>
              </div>
              
              <div className="text-center text-sm text-muted-foreground border-t pt-4">
                <p>
                  For WhatsApp pothole reporting, use our dedicated service number.
                  For general inquiries, use the contact methods above.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
