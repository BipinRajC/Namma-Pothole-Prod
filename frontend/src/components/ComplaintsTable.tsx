import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, MapPin, Calendar, Image as ImageIcon } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { StatusBadge } from "./StatusBadge";
import { ImagePreviewModal } from "./ImagePreviewModal";

interface ComplaintsTableProps {
  complaints: Complaint[];
  isLoading?: boolean;
  onViewOnMap?: (complaint: Complaint) => void;
}

/**
 * Complaints data table with status management and image preview
 */
export const ComplaintsTable = ({
  complaints,
  isLoading,
  onViewOnMap,
}: ComplaintsTableProps) => {
  const [selectedImage, setSelectedImage] = useState<{
    url: string;
    complaintId: string;
  } | null>(null);

  const formatDateTime = (timestamp: string) => {
    // Convert epoch seconds to milliseconds for JavaScript Date
    const timestampMs = parseInt(timestamp) * 1000;
    return new Date(timestampMs).toLocaleString("en-IN", {
      timeZone: "Asia/Kolkata",
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Complaints Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <div
                key={i}
                className="flex items-center space-x-4 animate-pulse"
              >
                <div className="h-4 bg-muted rounded w-32"></div>
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 bg-muted rounded w-40"></div>
                <div className="h-4 bg-muted rounded w-20"></div>
                <div className="h-4 bg-muted rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Complaints Management ({complaints.length} items)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">ID</TableHead>
                  <TableHead>Location</TableHead>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-center">Image</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {complaints.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={6}
                      className="h-24 text-center text-muted-foreground"
                    >
                      No complaints found
                    </TableCell>
                  </TableRow>
                ) : (
                  complaints.map((complaint) => (
                    <TableRow key={complaint._id} className="hover:bg-muted/50">
                      <TableCell className="font-mono text-xs">
                        <Badge variant="outline" className="font-mono">
                          {complaint._id.slice(-8)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3 text-muted-foreground" />
                          <span className="font-mono text-xs">
                            {formatCoordinates(
                              complaint.latitude,
                              complaint.longitude
                            )}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">
                            {formatDateTime(complaint.timestamp)}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <StatusBadge status={complaint.status} />
                      </TableCell>
                      <TableCell className="text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            setSelectedImage({
                              url: complaint.imageUrl,
                              complaintId: complaint._id,
                            })
                          }
                          className="h-8 w-8 p-0"
                        >
                          <ImageIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onViewOnMap?.(complaint)}
                          className="flex items-center gap-1"
                        >
                          <Eye className="h-3 w-3" />
                          View on Map
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <ImagePreviewModal
        isOpen={selectedImage !== null}
        onClose={() => setSelectedImage(null)}
        imageUrl={selectedImage?.url || ""}
        complaintId={selectedImage?.complaintId || ""}
      />
    </>
  );
};
