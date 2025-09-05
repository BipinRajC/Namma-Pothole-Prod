import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Download, 
  ExternalLink, 
  Image as ImageIcon, 
  Loader2,
  AlertCircle 
} from "lucide-react";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  complaintId: string;
}

/**
 * Modal component for previewing complaint images
 * Handles loading states and error cases for AWS S3 images
 */
export const ImagePreviewModal = ({
  isOpen,
  onClose,
  imageUrl,
  complaintId
}: ImagePreviewModalProps) => {
  const [imageLoading, setImageLoading] = useState(true);
  const [imageError, setImageError] = useState(false);

  const handleImageLoad = () => {
    setImageLoading(false);
    setImageError(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  const handleDownload = async () => {
    try {
      const response = await fetch(imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `pothole-complaint-${complaintId}.jpg`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const openInNewTab = () => {
    window.open(imageUrl, '_blank');
  };

  // Reset states when modal opens
  const handleOpenChange = (open: boolean) => {
    if (!open) {
      onClose();
    } else {
      setImageLoading(true);
      setImageError(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <ImageIcon className="h-5 w-5" />
            Pothole Image Preview
            <Badge variant="outline" className="font-mono">
              {complaintId.slice(-8)}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        <div className="relative">
          {/* Loading State */}
          {imageLoading && (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <p className="text-sm text-muted-foreground">Loading image...</p>
              </div>
            </div>
          )}

          {/* Error State */}
          {imageError && (
            <div className="flex items-center justify-center h-96 bg-muted rounded-lg">
              <div className="flex flex-col items-center gap-3 text-center">
                <AlertCircle className="h-12 w-12 text-destructive" />
                <div>
                  <h3 className="font-semibold text-foreground">Failed to load image</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    The image may be unavailable or the URL has expired
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={openInNewTab}
                  className="mt-2"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Try opening in new tab
                </Button>
              </div>
            </div>
          )}

          {/* Image */}
          <img
            src={imageUrl}
            alt={`Pothole complaint ${complaintId}`}
            className={`w-full h-auto max-h-[60vh] object-contain rounded-lg ${
              imageLoading || imageError ? 'hidden' : 'block'
            }`}
            onLoad={handleImageLoad}
            onError={handleImageError}
          />

          {/* Action Buttons */}
          {!imageLoading && !imageError && (
            <div className="flex justify-end gap-2 mt-4">
              <Button 
                variant="outline" 
                onClick={handleDownload}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                Download
              </Button>
              <Button 
                variant="outline"
                onClick={openInNewTab}
                className="flex items-center gap-2"
              >
                <ExternalLink className="h-4 w-4" />
                Open in New Tab
              </Button>
            </div>
          )}
        </div>

        {/* Image Metadata */}
        <div className="border-t pt-4 space-y-2">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium text-muted-foreground">Complaint ID:</span>
              <p className="font-mono">{complaintId}</p>
            </div>
            <div>
              <span className="font-medium text-muted-foreground">Image Source:</span>
              <p className="text-xs break-all">AWS S3 Presigned URL</p>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};