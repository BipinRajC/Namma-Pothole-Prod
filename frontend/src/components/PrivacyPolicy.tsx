import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Shield, Eye, Users, Lock, Mail } from "lucide-react";

/**
 * Privacy Policy component for Meta Business verification
 * Contains comprehensive privacy policy for business legitimacy
 */
export const PrivacyPolicy = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Shield className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Privacy Policy</h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Last updated: August 2025
        </p>
        <p className="text-muted-foreground">
          Namma Pothole is committed to protecting your privacy and ensuring the
          security of your personal information.
        </p>
      </div>

      <Separator />

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            About Namma Pothole
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Legal Business Name:</strong> Namma Pothole
          </p>
          <p>
            <strong>Business Address:</strong> Bengaluru, Karnataka, India
          </p>
          <p>
            <strong>Contact Email:</strong> namma.pothole@gmail.com
          </p>
          <p>
            <strong>Contact Phone:</strong> +91 9108420079
          </p>
          <p>
            <strong>Business Type:</strong> MSME government-registered civic
            technology service dedicated to improving urban road safety and
            infrastructure.
          </p>
        </CardContent>
      </Card>

      {/* Information We Collect */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Eye className="h-5 w-5" />
            Information We Collect
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Location Data</h4>
            <p className="text-muted-foreground">
              We collect location coordinates when you report potholes to help
              municipal authorities identify and address road issues. This data
              is essential for our civic service.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <p className="text-muted-foreground">
              We may collect phone numbers when users interact with our WhatsApp
              service for pothole reporting. This information is used solely for
              service delivery and follow-up communications.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">WhatsApp Communication Data</h4>
            <p className="text-muted-foreground">
              When you use our WhatsApp service, we collect:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>Your phone number (automatically provided by WhatsApp)</li>
              <li>Your WhatsApp profile name</li>
              <li>Messages and responses you send to our service</li>
              <li>Consent preferences and opt-out status</li>
              <li>Interaction timestamps for service improvement</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Images and Media</h4>
            <p className="text-muted-foreground">
              Users may submit photos of road conditions to help authorities
              assess the severity and nature of reported issues.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* WhatsApp Data Processing */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            WhatsApp Data Processing
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">
              Data Controller and Processor Relationship
            </h4>
            <p className="text-muted-foreground">
              Namma Pothole acts as the data controller, while WhatsApp
              LLC/WhatsApp Ireland Limited acts as the data processor for
              messages sent through their platform. This relationship is
              governed by WhatsApp's Business Data Processing Terms.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Shared with WhatsApp</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>Your phone number (for message delivery)</li>
              <li>Profile information you choose to share</li>
              <li>Messages and media you send to our service</li>
              <li>Location data when voluntarily shared</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Legal Basis for Processing</h4>
            <p className="text-muted-foreground">
              We process your WhatsApp data based on:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                <strong>Your explicit consent:</strong> Given when you agree to
                use our WhatsApp service
              </li>
              <li>
                <strong>Legitimate interest:</strong> Providing civic technology
                services for public infrastructure improvement
              </li>
              <li>
                <strong>Public interest:</strong> Facilitating communication
                between citizens and municipal authorities
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              Your Rights Regarding WhatsApp Data
            </h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Opt-out:</strong> Send "STOP" to unsubscribe anytime
              </li>
              <li>
                <strong>Data access:</strong> Request copies of your data we
                hold
              </li>
              <li>
                <strong>Data deletion:</strong> Request deletion of your
                information
              </li>
              <li>
                <strong>Data portability:</strong> Request your data in a
                portable format
              </li>
              <li>
                <strong>Withdraw consent:</strong> Revoke consent for future
                data processing
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">WhatsApp's Privacy Policy</h4>
            <p className="text-muted-foreground">
              WhatsApp's processing of your data is also governed by their
              Privacy Policy. We recommend reviewing WhatsApp's terms to
              understand how they handle your communications.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* How We Use Information */}
      <Card>
        <CardHeader>
          <CardTitle>How We Use Your Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li>• Process and manage pothole reports submitted by citizens</li>
            <li>
              • Coordinate with municipal authorities for infrastructure
              improvements
            </li>
            <li>• Provide updates on the status of reported issues</li>
            <li>• Improve our civic technology services</li>
            <li>• Ensure the safety and security of our platform</li>
            <li>• Comply with legal obligations and government requirements</li>
          </ul>
        </CardContent>
      </Card>

      {/* Data Security */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Data Security
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We implement appropriate technical and organizational security
            measures to protect your personal information against unauthorized
            access, alteration, disclosure, or destruction. All data
            transmission is secured using industry-standard encryption
            protocols.
          </p>
          <p className="text-muted-foreground">
            As a MSME government-registered civic technology service, we adhere
            to strict data protection standards and comply with applicable
            privacy laws and regulations.
          </p>
        </CardContent>
      </Card>

      {/* Data Sharing */}
      <Card>
        <CardHeader>
          <CardTitle>Data Sharing and Disclosure</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            We share location and issue data with relevant municipal authorities
            and government agencies solely for the purpose of addressing
            reported infrastructure problems. We do not sell, trade, or transfer
            personal information to third parties for commercial purposes.
          </p>
          <div>
            <h4 className="font-semibold mb-2">Authorized Sharing Includes:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Municipal corporations for road maintenance</li>
              <li>• Government agencies for infrastructure planning</li>
              <li>• Emergency services when public safety is at risk</li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* User Rights */}
      <Card>
        <CardHeader>
          <CardTitle>Your Rights</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <ul className="space-y-2 text-muted-foreground">
            <li>• Right to access your personal information</li>
            <li>• Right to correct inaccurate data</li>
            <li>
              • Right to request deletion of your data (subject to legal
              requirements)
            </li>
            <li>• Right to withdraw consent for data processing</li>
            <li>• Right to file complaints with data protection authorities</li>
          </ul>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Us
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            If you have any questions about this Privacy Policy or our data
            practices, please contact us:
          </p>
          <div className="space-y-2">
            <p>
              <strong>Email:</strong> namma.pothole@gmail.com
            </p>
            <p>
              <strong>Phone:</strong> +91 9108420079
            </p>
            <p>
              <strong>Address:</strong> Bengaluru, Karnataka, India
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Updates */}
      <Card>
        <CardHeader>
          <CardTitle>Policy Updates</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We may update this Privacy Policy from time to time to reflect
            changes in our practices or legal requirements. We will notify users
            of any material changes through our website or direct communication
            channels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
