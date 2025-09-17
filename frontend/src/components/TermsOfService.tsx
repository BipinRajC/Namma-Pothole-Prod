import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FileText, AlertTriangle, Users, Gavel, Mail } from "lucide-react";

/**
 * Terms of Service component for Meta Business verification
 * Contains comprehensive terms of service for business legitimacy
 */
export const TermsOfService = () => {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            Terms of Service
          </h1>
        </div>
        <p className="text-lg text-muted-foreground">
          Last updated: August 2025
        </p>
        <p className="text-muted-foreground">
          Please read these Terms of Service carefully before using our civic
          technology platform.
        </p>
      </div>

      <Separator />

      {/* Business Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Service Provider Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p>
            <strong>Service Provider:</strong> Namma Pothole
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
            <strong>Business Description:</strong> Namma Pothole is a MSME
            government-registered civic technology service dedicated to
            improving urban road safety and infrastructure. Our organization
            empowers residents to report potholes and road hazards, facilitating
            prompt communication and actionable insights for local authorities.
          </p>
        </CardContent>
      </Card>

      {/* Acceptance of Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Acceptance of Terms</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            By accessing and using the Namma Pothole platform, you accept and
            agree to be bound by the terms and provision of this agreement. If
            you do not agree to abide by the above, please do not use this
            service.
          </p>
          <p className="text-muted-foreground">
            This service is operated by Namma Pothole, a MSME
            government-registered civic technology organization, in cooperation
            with municipal authorities for the purpose of improving urban
            infrastructure and road safety.
          </p>
        </CardContent>
      </Card>

      {/* Service Description */}
      <Card>
        <CardHeader>
          <CardTitle>Service Description</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Our Services Include:</h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>• Pothole and road hazard reporting platform</li>
              <li>• WhatsApp-based reporting system</li>
              <li>• Real-time tracking dashboard for reported issues</li>
              <li>• Coordination with municipal authorities</li>
              <li>• Public infrastructure improvement facilitation</li>
            </ul>
          </div>
          <p className="text-muted-foreground">
            Our platform serves as a bridge between citizens and municipal
            authorities, enabling efficient reporting and management of urban
            infrastructure issues.
          </p>
        </CardContent>
      </Card>

      {/* User Responsibilities */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            User Responsibilities
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">
              When using our service, users agree to:
            </h4>
            <ul className="space-y-1 text-muted-foreground">
              <li>
                • Provide accurate and truthful information about road
                conditions
              </li>
              <li>
                • Report genuine infrastructure issues that require municipal
                attention
              </li>
              <li>
                • Respect the privacy and safety of others when taking
                photographs
              </li>
              <li>• Use the service only for its intended civic purpose</li>
              <li>• Not submit false, misleading, or duplicate reports</li>
              <li>
                • Comply with all applicable local, state, and national laws
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>

      {/* Prohibited Uses */}
      <Card>
        <CardHeader>
          <CardTitle>Prohibited Uses</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Users may not use our service for:
          </p>
          <ul className="space-y-1 text-muted-foreground">
            <li>• Submitting false or malicious reports</li>
            <li>• Harassing or threatening municipal officials</li>
            <li>• Uploading inappropriate, offensive, or illegal content</li>
            <li>• Attempting to compromise the security of our systems</li>
            <li>
              • Commercial or promotional activities unrelated to civic
              improvement
            </li>
            <li>• Any activity that could harm public safety or welfare</li>
          </ul>
        </CardContent>
      </Card>

      {/* WhatsApp Service Terms */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            WhatsApp Communication Service
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <h4 className="font-semibold mb-2">Service Description</h4>
            <p className="text-muted-foreground">
              We provide a WhatsApp-based reporting service that allows citizens
              to report road infrastructure issues directly through WhatsApp
              messaging. This service is subject to both our terms and
              WhatsApp's Business Terms of Service.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Consent and Authorization</h4>
            <p className="text-muted-foreground">
              By using our WhatsApp service, you explicitly consent to:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                Receiving messages from Namma Pothole for service notifications
              </li>
              <li>
                Sharing your contact information with WhatsApp as required for
                message delivery
              </li>
              <li>
                Having your reports processed and shared with municipal
                authorities
              </li>
              <li>Data processing as described in our Privacy Policy</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Opt-out Rights</h4>
            <p className="text-muted-foreground">
              You may opt-out of our WhatsApp service at any time by:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                Sending "STOP", "UNSUBSCRIBE", or "OPT-OUT" to our WhatsApp
                number
              </li>
              <li>Blocking our WhatsApp business account</li>
              <li>Contacting us directly at namma.pothole@gmail.com</li>
            </ul>
            <p className="text-muted-foreground mt-2">
              Opting out will not affect previously submitted reports, which
              remain active for municipal action.
            </p>
          </div>

          <div>
            <h4 className="font-semibold mb-2">
              WhatsApp Business Policy Compliance
            </h4>
            <p className="text-muted-foreground">
              Our WhatsApp service complies with:
            </p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>WhatsApp Business Terms of Service</li>
              <li>WhatsApp Business Messaging Policy</li>
              <li>WhatsApp Business Data Processing Terms</li>
              <li>All applicable data protection and privacy laws</li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Service Limitations</h4>
            <p className="text-muted-foreground">Our WhatsApp service:</p>
            <ul className="list-disc list-inside text-muted-foreground ml-4 space-y-1 mt-2">
              <li>
                Is intended for business/civic use only, not personal
                communications
              </li>
              <li>
                Operates within WhatsApp's 24-hour messaging window for
                responses
              </li>
              <li>
                May be temporarily unavailable due to technical issues or
                maintenance
              </li>
              <li>
                Does not provide emergency services or immediate response
                capabilities
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold mb-2">Data Sharing with WhatsApp</h4>
            <p className="text-muted-foreground">
              When you use our WhatsApp service, certain data is shared with
              WhatsApp LLC/WhatsApp Ireland Limited as required for message
              delivery. This includes your phone number, messages, and any media
              you share. WhatsApp acts as our data processor under their
              Business Data Processing Terms.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Government Cooperation */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Gavel className="h-5 w-5" />
            Government Cooperation
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            As a MSME government-registered civic technology service, Namma
            Pothole operates in full cooperation with municipal authorities and
            government agencies. We share reported data with relevant
            authorities for the sole purpose of improving public infrastructure
            and ensuring citizen safety.
          </p>
          <p className="text-muted-foreground">
            Our service is designed to support and enhance existing municipal
            processes, not to replace official reporting channels or emergency
            services.
          </p>
        </CardContent>
      </Card>

      {/* Liability and Disclaimers */}
      <Card>
        <CardHeader>
          <CardTitle>Liability and Disclaimers</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Namma Pothole provides this service on an "as is" basis. While we
            strive to facilitate prompt attention to reported issues, we cannot
            guarantee response times or specific outcomes from municipal
            authorities.
          </p>
          <p className="text-muted-foreground">
            Users understand that reporting through our platform does not
            guarantee immediate action and should continue to use official
            emergency services for urgent safety hazards.
          </p>
        </CardContent>
      </Card>

      {/* Data Usage */}
      <Card>
        <CardHeader>
          <CardTitle>Data Usage and Privacy</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            By using our service, you acknowledge that reported data (including
            location coordinates, photographs, and contact information) may be
            shared with municipal authorities and government agencies for
            infrastructure improvement purposes.
          </p>
          <p className="text-muted-foreground">
            For detailed information about how we collect, use, and protect your
            data, please refer to our Privacy Policy.
          </p>
        </CardContent>
      </Card>

      {/* Service Modifications */}
      <Card>
        <CardHeader>
          <CardTitle>Service Modifications</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            Namma Pothole reserves the right to modify, suspend, or discontinue
            any aspect of the service at any time. We will provide reasonable
            notice of significant changes through our website or direct
            communication channels.
          </p>
        </CardContent>
      </Card>

      {/* Contact Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            Contact Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground">
            For questions about these Terms of Service or our civic technology
            platform, please contact us:
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

      {/* Updates to Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Updates to Terms</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            We may update these Terms of Service from time to time to reflect
            changes in our services, legal requirements, or operational
            practices. Users will be notified of material changes through our
            website or direct communication.
          </p>
          <p className="text-muted-foreground mt-4">
            Continued use of our service after any such changes constitutes
            acceptance of the new Terms of Service.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
