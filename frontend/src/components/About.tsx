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
  MapPin,
} from "lucide-react";

interface Developer {
  name: string;
  email: string;
  linkedin: string;
  role?: string;
  bio?: string;
  image?: string;
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
      role: "Developer",
      image: "/Sravan-Image.jpeg",
    },
    {
      name: "Amol",
      email: "amol.vyas0630@gmail.com",
      linkedin: "https://www.linkedin.com/in/amol-vyas-918601293/",
      role: "Developer",
      image: "/Amol-Image.jpeg",
    },
    {
      name: "Bipin Raj C",
      email: "bipinraj.4604@gmail.com",
      linkedin: "https://www.linkedin.com/in/bipin-raj-c-b61670283/",
      role: "Developer",
      image: "/Bipin-Image.jpeg",
    },
    {
      name: "Pratheek",
      email: "Pratheekbichagal75@gmail.com",
      linkedin: "https://www.linkedin.com/in/pratheek-bichagal-aa3178275/",
      role: "Operations",
      image: "/Pratheek-Image.jpeg",
    },
    {
      name: "Joel T Thomas",
      email: "joeljoef1417@gmail.com",
      linkedin: "https://www.linkedin.com/in/joel-t-thomas-5862aa289?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=android_app",
      role: "Social Media Manager",
      image: "/Joel-Image.jpeg",
    },
    {
      name: "Varun Joshi",
      email: "varunjoshi032@gmail.com",
      linkedin: "https://www.linkedin.com/in/varun-joshi-558416264/?utm_source=share&utm_campaign=share_via&utm_content=profile&utm_medium=ios_app",
      role: "Social Media Manager",
      image: "/Varun-Image.jpeg",
    }
  ];

  const openLinkedIn = (url: string) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const sendEmail = (email: string) => {
    window.open(`mailto:${email}`, "_self");
  };

  return (
    <div className="space-y-8">
      {/* Header Section */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="p-3 bg-primary/10 rounded-full">
            <MapPin className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">
            About Namma Pothole
          </h1>
        </div>
        <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
          Namma Pothole is a MSME government-registered civic technology service
          dedicated to improving urban road safety and infrastructure. Our
          organization empowers residents to report potholes and road hazards,
          facilitating prompt communication and actionable insights for local
          authorities. By streamlining the maintenance reporting process, we
          support municipal agencies in efficiently managing repairs and
          enhancing the quality of public roadways for all citizens.
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
            The passionate team behind this initiative
          </p>
        </div>

        {/* Dynamic responsive flexbox layout */}
        <div className="flex flex-wrap justify-center gap-6">
          {developers.map((developer, index) => (
            <div
              key={index}
              className="group relative transform transition-all duration-300 hover:scale-105 w-full sm:w-[calc(50%-12px)] lg:w-[calc(33.333%-16px)] xl:w-[calc(33.333%-16px)] 2xl:w-[calc(25%-18px)] min-w-[280px] max-w-[350px]"
            >
              <Card className="h-full hover:shadow-2xl transition-all duration-500 border-2 hover:border-primary/30 group-hover:bg-gradient-to-br group-hover:from-primary/5 group-hover:to-secondary/5 backdrop-blur-sm">
                <CardHeader className="text-center pb-4 relative">
                  {/* Decorative elements */}
                  <div className="absolute top-2 right-2 w-4 h-4 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 left-2 w-2 h-2 bg-gradient-to-br from-secondary/20 to-primary/20 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75"></div>
                  
                  {/* Profile image with enhanced styling */}
                  <div className="relative w-24 h-24 lg:w-28 lg:h-28 rounded-full mx-auto mb-4 overflow-hidden group-hover:ring-4 group-hover:ring-primary/20 transition-all duration-300">
                    <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full group-hover:scale-110 transition-transform duration-300"></div>
                    {developer.image ? (
                      <img
                        src={developer.image}
                        alt={`${developer.name} profile`}
                        className="relative w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                      />
                    ) : (
                      <div className="relative w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                        <span className="text-3xl font-bold text-primary group-hover:scale-110 transition-transform duration-300">
                          {developer.name.charAt(0)}
                        </span>
                      </div>
                    )}
                  </div>
                  
                  <CardTitle className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent group-hover:from-primary group-hover:to-secondary transition-all duration-300">
                    {developer.name}
                  </CardTitle>
                  
                  {developer.role && (
                    <Badge 
                      variant="secondary" 
                      className="w-fit mx-auto mt-2 group-hover:bg-primary/10 group-hover:text-primary group-hover:border-primary/20 transition-all duration-300"
                    >
                      {developer.role}
                    </Badge>
                  )}
                </CardHeader>
                
                <CardContent className="space-y-4 flex-1 flex flex-col justify-between">
                  {developer.bio && (
                    <p className="text-sm text-muted-foreground text-center leading-relaxed">
                      {developer.bio}
                    </p>
                  )}

                  <div className="space-y-3 mt-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2 group-hover:border-primary/50 hover:bg-primary/5 transition-all duration-300"
                      onClick={() => sendEmail(developer.email)}
                    >
                      <Mail className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="truncate">Email</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 transition-all duration-300"
                      onClick={() => openLinkedIn(developer.linkedin)}
                    >
                      <Linkedin className="h-4 w-4 transition-transform duration-300 group-hover:scale-110" />
                      <span className="truncate">LinkedIn</span>
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      <Separator />

      {/* Business Information Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Business Information
          </h2>
          <p className="text-muted-foreground">
            Official business details and registration information
          </p>
        </div>

        <Card>
          <CardContent className="p-8">
            <div className="grid gap-8 md:grid-cols-2">
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Legal Business Name
                  </h3>
                  <p className="text-muted-foreground">Namma Pothole</p>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Business Address
                  </h3>
                  <p className="text-muted-foreground">
                    Bengaluru, Karnataka, India
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-2">
                    Contact Information
                  </h3>
                  <div className="space-y-2">
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Mail className="h-4 w-4" />
                      namma.pothole@gmail.com
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <Phone className="h-4 w-4" />
                      +91 9108420079
                    </p>
                    <p className="text-muted-foreground flex items-center gap-2">
                      <MapPin className="h-4 w-4" />
                      Bengaluru, Karnataka
                    </p>
                  </div>
                </div>

                <div>
                  <h3 className="text-lg font-semibold mb-2">Business Type</h3>
                  <p className="text-muted-foreground">
                    MSME government-registered civic technology service
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Contact Section */}
      <div className="space-y-6">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Contact Us
          </h2>
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
                  onClick={() => sendEmail("namma.pothole@gmail.com")}
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
                  onClick={() => window.open("tel:+919611379776")}
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
          <h2 className="text-3xl font-bold text-foreground mb-2">
            Project Mission
          </h2>
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
                  To create a more responsive and efficient system for reporting
                  and resolving infrastructure issues in Bengaluru, leveraging
                  technology to bridge the gap between citizens and municipal
                  authorities.
                </p>
              </div>

              <div className="space-y-4">
                <h3 className="text-xl font-semibold flex items-center gap-2">
                  <Heart className="h-5 w-5 text-primary" />
                  Community Impact
                </h3>
                <p className="text-muted-foreground">
                  By enabling easy reporting through WhatsApp and providing
                  transparent tracking through this dashboard, we aim to improve
                  road safety and quality of life for all Bengaluru residents.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

    </div>
  );
};
