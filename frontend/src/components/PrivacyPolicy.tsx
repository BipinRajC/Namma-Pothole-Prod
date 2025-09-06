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
          Namma Pothole is committed to protecting your privacy and ensuring the security of your personal information.
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
            <strong>Business Address:</strong> 11, Lake City Layout, 6th cross road, Kodichikkanahalli, Behind Janapriya Apts Phase2, Bengaluru, Karnataka, India
          </p>
          <p>
            <strong>Contact Email:</strong> namma.pothole@gmail.com
          </p>
          <p>
            <strong>Contact Phone:</strong> +91 7676795199
          </p>
          <p>
            <strong>Business Type:</strong> Government-registered civic technology service dedicated to improving urban road safety and infrastructure.
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
              We collect location coordinates when you report potholes to help municipal authorities identify and address road issues. This data is essential for our civic service.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <p className="text-muted-foreground">
              We may collect phone numbers when users interact with our WhatsApp service for pothole reporting. This information is used solely for service delivery and follow-up communications.
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-2">Images and Media</h4>
            <p className="text-muted-foreground">
              Users may submit photos of road conditions to help authorities assess the severity and nature of reported issues.
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
            <li>• Coordinate with municipal authorities for infrastructure improvements</li>
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
            We implement appropriate technical and organizational security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. All data transmission is secured using industry-standard encryption protocols.
          </p>
          <p className="text-muted-foreground">
            As a government-registered civic technology service, we adhere to strict data protection standards and comply with applicable privacy laws and regulations.
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
            We share location and issue data with relevant municipal authorities and government agencies solely for the purpose of addressing reported infrastructure problems. We do not sell, trade, or transfer personal information to third parties for commercial purposes.
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
            <li>• Right to request deletion of your data (subject to legal requirements)</li>
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
            If you have any questions about this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="space-y-2">
            <p><strong>Email:</strong> namma.pothole@gmail.com</p>
            <p><strong>Phone:</strong> +91 7676795199</p>
            <p><strong>Address:</strong> 11, Lake City Layout, 6th cross road, Kodichikkanahalli, Behind Janapriya Apts Phase2, Bengaluru, Karnataka, India</p>
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
            We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify users of any material changes through our website or direct communication channels.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
