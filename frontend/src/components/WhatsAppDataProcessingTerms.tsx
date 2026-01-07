import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Database,
  Users,
  Lock,
  Mail,
  FileText,
  Globe,
} from "lucide-react";

/**
 * WhatsApp Data Processing Terms component for compliance with WhatsApp Business Terms
 * Covers data controller/processor relationship and GDPR/privacy law requirements
 */
export const WhatsAppDataProcessingTerms = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <Database className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            WhatsApp Data Processing Terms
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Last updated: August 2025
        </p>
        <p className="text-muted-foreground">
          These terms govern how Namma Pothole processes personal data through
          WhatsApp Business Platform
        </p>
      </div>

      <Separator />

      {/* Controller and Processor Roles */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Data Controller and Processor Relationship
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">
              Data Controller: Namma Pothole
            </h4>
            <p className="text-muted-foreground">
              Namma Pothole acts as the data controller for all personal
              information processed through our WhatsApp service. We determine
              the purposes and means of processing your personal data.
            </p>
            <div className="mt-2">
              <p className="text-sm text-muted-foreground">
                <strong>Legal Entity:</strong> Namma Pothole
                <br />
                <strong>Address:</strong> Bengaluru, Karnataka, India
                <br />
                <strong>Contact:</strong> namma.pothole@gmail.com
              </p>
            </div>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Processor: WhatsApp</h4>
            <p className="text-muted-foreground">
              WhatsApp LLC (for users outside the European Region) or WhatsApp
              Ireland Limited (for users in the European Region) acts as our
              data processor for messages sent through their platform. WhatsApp
              processes personal data on our behalf according to our
              instructions and their Business Data Processing Terms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Processing Activities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Processing Activities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Data Categories Processed</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Contact Data:</strong> Phone numbers, WhatsApp profile
                names
              </li>
              <li>
                <strong>Communication Data:</strong> Messages, responses,
                interaction timestamps
              </li>
              <li>
                <strong>Location Data:</strong> GPS coordinates when voluntarily
                shared
              </li>
              <li>
                <strong>Media Data:</strong> Images and videos of infrastructure
                issues
              </li>
              <li>
                <strong>Consent Data:</strong> Consent preferences and opt-out
                status
              </li>
              <li>
                <strong>Technical Data:</strong> Session information for service
                delivery
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Processing Purposes</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                Facilitating civic infrastructure reporting through WhatsApp
              </li>
              <li>Coordinating with municipal authorities for road repairs</li>
              <li>Providing service confirmations and updates</li>
              <li>Managing user consent and opt-out preferences</li>
              <li>Ensuring service security and preventing abuse</li>
              <li>Complying with legal and regulatory requirements</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Legal Basis for Processing</h4>
            <ul className="list-disc list-inside text-muted-foreground space-y-1">
              <li>
                <strong>Consent (GDPR Art. 6(1)(a)):</strong> Explicit consent
                for WhatsApp communications
              </li>
              <li>
                <strong>Legitimate Interest (GDPR Art. 6(1)(f)):</strong>{" "}
                Providing civic technology services
              </li>
              <li>
                <strong>Public Interest (GDPR Art. 6(1)(e)):</strong> Supporting
                municipal infrastructure management
              </li>
              <li>
                <strong>Legal Obligation (GDPR Art. 6(1)(c)):</strong>{" "}
                Compliance with applicable laws
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Data Subject Rights */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Your Rights as a Data Subject
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Under applicable data protection laws (including GDPR, CCPA, and
            Indian data protection regulations), you have the following rights:
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h5 className="font-semibold mb-2">Access and Portability</h5>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Request copies of your personal data</li>
                <li>Receive data in a portable format</li>
                <li>Transfer data to another service</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2">Correction and Deletion</h5>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Correct inaccurate information</li>
                <li>Request deletion of your data</li>
                <li>Erase data when no longer needed</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2">Processing Controls</h5>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Restrict or limit processing</li>
                <li>Object to certain processing</li>
                <li>Withdraw consent anytime</li>
              </ul>
            </div>

            <div>
              <h5 className="font-semibold mb-2">Complaints and Appeals</h5>
              <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
                <li>Lodge complaints with authorities</li>
                <li>Appeal our decisions</li>
                <li>Seek judicial remedies</li>
              </ul>
            </div>
          </div>

          <div className="mt-4 p-4 bg-muted/50 rounded-lg">
            <h5 className="font-semibold mb-2">How to Exercise Your Rights</h5>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>
                <strong>WhatsApp Opt-out:</strong> Send "STOP" to our WhatsApp
                number
              </li>
              <li>
                <strong>General Requests:</strong> Email namma.pothole@gmail.com
              </li>
              <li>
                <strong>Formal Complaints:</strong> Contact relevant data
                protection authority
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Security and International Transfers */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lock className="h-5 w-5" />
            Security and International Transfers
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Security Measures</h4>
            <p className="text-muted-foreground">
              We implement appropriate technical and organizational security
              measures to protect your personal data:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>End-to-end encryption through WhatsApp platform</li>
              <li>Secure data storage on AWS infrastructure</li>
              <li>Access controls and authentication</li>
              <li>Regular security audits and monitoring</li>
              <li>Data minimization and retention policies</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">International Data Transfers</h4>
            <p className="text-muted-foreground">
              Your data may be transferred to and processed in countries outside
              your jurisdiction, including:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                <strong>WhatsApp Servers:</strong> Located globally including US
                and Ireland
              </li>
              <li>
                <strong>AWS Infrastructure:</strong> Our data storage in secure
                AWS regions
              </li>
              <li>
                <strong>Safeguards:</strong> Transfers protected by adequacy
                decisions, standard contractual clauses, or equivalent
                protections
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Retention and Updates */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Data Retention and Updates
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Data Retention</h4>
            <p className="text-muted-foreground">
              We retain personal data only as long as necessary for our
              legitimate purposes:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                <strong>Active Reports:</strong> Retained until municipal action
                is completed
              </li>
              <li>
                <strong>Consent Records:</strong> Retained for legal compliance
                (typically 7 years)
              </li>
              <li>
                <strong>Communication Data:</strong> Retained for service
                delivery and support
              </li>
              <li>
                <strong>Opted-out Users:</strong> Contact details retained only
                to honor opt-out preferences
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Updates to These Terms</h4>
            <p className="text-muted-foreground">
              We may update these data processing terms to reflect changes in
              our processing activities, legal requirements, or WhatsApp's
              Business Terms. Material changes will be communicated through our
              website and WhatsApp service where required by law.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Contact Information</h4>
            <p className="text-muted-foreground">
              For questions about data processing or to exercise your rights:
            </p>
            <div className="mt-2 p-3 bg-muted/30 rounded-lg">
              <p className="text-sm text-muted-foreground">
                <strong>Email:</strong> namma.pothole@gmail.com
                <br />
                <strong>Subject:</strong> Data Protection Request
                <br />
                <strong>WhatsApp:</strong> Send "STOP" for opt-out or contact us
                directly
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
