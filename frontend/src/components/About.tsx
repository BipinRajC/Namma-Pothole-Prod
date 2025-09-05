import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { 
  Users, 
  Mail, 
  Phone, 
  Linkedin, 
  Github, 
  Globe,
  Heart,
  Code,
  MapPin
} from "lucide-react";

interface Developer {
  name: string;
  email: string;
  linkedin: string;
  role?: string;
  bio?: string;
}

/**
 * About page component displaying information about the creators
 * and contact details for the Namma Pothole project
 */
export const About = () => {
  const developers: Developer[] = [
    {
      name: "Sravan",
      email: "sravankarthikskt@gmail.com",
      linkedin: "https://in.linkedin.com/in/sravankarthik",
      role: "Full Stack Developer",
      bio: "Passionate about creating solutions that make a difference in urban infrastructure."
    },
    {
      name: "Amol",
      email: "amol.vyas0630@gmail.com", 
      linkedin: "https://www.linkedin.com/in/amol-vyas-918601293/",
      role: "Frontend Developer",
      bio: "Focused on building intuitive user interfaces and seamless user experiences."
    },
    {
      name: "Bipin Raj C",
      email: "bipinraj.4604@gmail.com",
      linkedin: "https://www.linkedin.com/in/bipin-raj-c-b61670283/",
      role: "Backend Developer", 
      bio: "Specialized in robust backend systems and API development for scalable applications."
    }
  ];

  const openLinkedIn = (url: string) => {
    window.open(url, '_blank', 'noopener,noreferrer');
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, '_self');
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">About Namma Pothole</h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          A citizen-driven initiative to improve Bengaluru's road infrastructure through 
          technology and community engagement. Report potholes via WhatsApp and track 
          their resolution in real-time.
        </p>
        <div className="flex items-center justify-center gap-2 mt-4">
          <Badge variant="secondary" className="flex items-center gap-1">
            <Heart className="h-3 w-3" />
            Made with love for Bengaluru
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1">
            <Code className="h-3 w-3" />
            Open Source
          </Badge>
        </div>
      </div>

      <Separator />

      {/* Developers Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2 flex items-center justify-center gap-2">
            <Users className="h-7 w-7" />
            Meet the Team
          </h2>
          <p className="text-muted-foreground">
            The passionate developers behind this initiative
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {developers.map((developer, index) => (
            <Card key={index} className="hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/20">
              <CardHeader className="text-center pb-4">
                <div className="w-20 h-20 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <span className="text-2xl font-bold text-primary">
                    {developer.name.charAt(0)}
                  </span>
                </div>
                <CardTitle className="text-xl">{developer.name}</CardTitle>
                {developer.role && (
                  <Badge variant="secondary" className="w-fit mx-auto">
                    {developer.role}
                  </Badge>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {developer.bio && (
                  <p className="text-sm text-muted-foreground text-center">
                    {developer.bio}
                  </p>
                )}
                
                <div className="space-y-3">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2"
                    onClick={() => sendEmail(developer.email)}
                  >
                    <Mail className="h-4 w-4" />
                    Email
                  </Button>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    onClick={() => openLinkedIn(developer.linkedin)}
                  >
                    <Linkedin className="h-4 w-4" />
                    LinkedIn
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Separator />

      {/* Contact Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Contact Us</h2>
          <p className="text-muted-foreground">
            Have questions, suggestions, or want to contribute? Reach out to us!
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 max-w-4xl mx-auto">
          {/* Email Contact */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-blue-100 dark:bg-blue-900/20 rounded-full mx-auto flex items-center justify-center">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Email Support</h3>
                <p className="text-muted-foreground mb-4">
                  Get in touch for support, partnerships, or feedback
                </p>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => sendEmail('namma.pothole@gmail.com')}
                >
                  <Mail className="h-4 w-4" />
                  namma.pothole@gmail.com
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Phone Contact */}
          <Card className="hover:shadow-md transition-shadow">
            <CardContent className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/20 rounded-full mx-auto flex items-center justify-center">
                <Phone className="h-8 w-8 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-lg mb-2">Phone Support</h3>
                <p className="text-muted-foreground mb-4">
                  Call us for urgent matters or technical assistance
                </p>
                <Button
                  variant="outline"
                  className="flex items-center gap-2 mx-auto"
                  onClick={() => window.open('tel:+919108420079')}
                >
                  <Phone className="h-4 w-4" />
                  +91 9108420079
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Project Information */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">Project Mission</h2>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Globe className="h-5 w-5 text-primary" />
                  Our Vision
                </h3>
                <p className="text-muted-foreground">
                  To create a more responsive and efficient system for reporting and 
                  resolving infrastructure issues in Bengaluru, leveraging technology 
                  to bridge the gap between citizens and municipal authorities.
                </p>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Community Impact
                </h3>
                <p className="text-muted-foreground">
                  By enabling easy reporting through WhatsApp and providing transparent 
                  tracking through this dashboard, we aim to improve road safety and 
                  quality of life for all Bengaluru residents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Footer */}
      <div className="text-center py-8 border-t">
        <p className="text-sm text-muted-foreground">
          © 2024 Namma Pothole. Built with ❤️ for Bengaluru's infrastructure.
        </p>
        <p className="text-xs text-muted-foreground mt-2">
          Open source project contributing to smart city initiatives.
        </p>
      </div>
    </div>
  );
};
