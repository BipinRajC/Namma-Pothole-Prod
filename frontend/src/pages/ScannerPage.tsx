import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageCircle } from "lucide-react";

const ScannerPage = () => {
  const [qrCodeData, setQrCodeData] = useState<string>("");

  useEffect(() => {
    // Generate QR code data URL for WhatsApp link
    const generateQRCode = async () => {
      try {
        // Using a simple method to generate QR code without external libraries
        // We'll use QR Server API for generating QR codes
        const whatsappLink = "https://wa.me/919108420079?text=Hi";
        const qrApiUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(whatsappLink)}`;
        setQrCodeData(qrApiUrl);
      } catch (error) {
        console.error("Error generating QR code:", error);
      }
    };

    generateQRCode();
  }, []);

  const handleDirectChat = () => {
    window.open("https://wa.me/919108420079?text=Hi", "_blank");
  };

  return (
    <div className="min-h-screen bg-dashboard-bg flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center gap-3 mb-4">
            <img 
              src="/profile-image.png" 
              alt="Namma Pothole Logo" 
              className="h-12 w-12 object-contain"
            />
            <h1 className="text-2xl font-bold text-foreground">
              Namma Pothole
            </h1>
          </div>
          <h2 className="text-xl font-semibold text-foreground">
            Chat with Our Bot
          </h2>
          <p className="text-muted-foreground">
            Scan the QR code below to start chatting with our WhatsApp bot
          </p>
        </div>

        {/* QR Code Card */}
        <Card className="w-full">
          <CardHeader className="text-center">
            <CardTitle className="flex items-center justify-center gap-2">
              Scan QR Code to Start Chatting with Bot
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center space-y-4">
            
              <img
                src="/qr-bot.png"
                alt="WhatsApp QR Code"
                className="w-64 h-64 border rounded-lg shadow-sm"
              />
            
            
            <div className="text-center space-y-2 flex flex-col items-center">
              <p className="text-sm text-muted-foreground">
                Or click the button below to chat directly
              </p>
              <Button
                onClick={handleDirectChat}
                className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white"
              >
                <MessageCircle className="h-4 w-4 mx-auto" />
                Chat with Bot
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Instructions */}
        <Card className="w-full">
          <CardContent className="pt-6">
            <div className="space-y-3 text-sm text-muted-foreground">
              <h3 className="font-semibold text-foreground">How to use:</h3>
              <ol className="list-decimal list-inside space-y-1">
                <li>Open WhatsApp on your phone</li>
                <li>Tap the camera icon or QR scanner</li>
                <li>Point your camera at the QR code above</li>
                <li>Tap to open the chat with our bot</li>
                <li>Start reporting potholes instantly!</li>
              </ol>
            </div>
          </CardContent>
        </Card>

        {/* Back to Dashboard */}
        <div className="text-center">
          <Button
            variant="outline"
            onClick={() => window.location.href = "/"}
            className="w-full"
          >
            Back to Dashboard
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ScannerPage;
