import { useState, useEffect, useMemo } from "react";
import Fuse from "fuse.js";
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
import { Input } from "@/components/ui/input";
import { Eye, MapPin, Calendar, ImageIcon, Search, X } from "lucide-react";
import { Complaint } from "@/types/complaint";
import { StatusBadge } from "./StatusBadge";
// import { ImagePreviewModal } from "./ImagePreviewModal";

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
  const [searchTerm, setSearchTerm] = useState("");
  
  // const [selectedImage, setSelectedImage] = useState<{
  //   url: string;
  //   complaintId: string;
  // } | null>(null);

  // Utility functions - declared first to avoid hoisting issues
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

  // Clear search
  const clearSearch = () => {
    setSearchTerm("");
  };

  // Fuse.js configuration for fuzzy search
  const fuseOptions = useMemo(() => ({
    // Threshold for fuzzy matching (0.0 = exact match, 1.0 = match anything)
    threshold: 0.4,
    // Number of characters that must be matched
    minMatchCharLength: 1,
    // Include match score and indices for highlighting
    includeScore: true,
    includeMatches: true,
    // Fields to search in
    keys: [
      {
        name: 'complaintId',
        weight: 0.3
      },
      {
        name: 'status',
        weight: 0.2
      },
      {
        name: 'coordinates',
        weight: 0.3
      },
      {
        name: 'formattedDate',
        weight: 0.2
      }
    ]
  }), []);

  // Prepare search data with additional searchable fields
  const searchableComplaints = useMemo(() => {
    return complaints.map(complaint => ({
      ...complaint,
      coordinates: formatCoordinates(complaint.latitude, complaint.longitude),
      formattedDate: formatDateTime(complaint.timestamp),
      shortId: complaint.complaintId.slice(-8)
    }));
  }, [complaints]);

  // Initialize Fuse instance
  const fuse = useMemo(() => {
    return new Fuse(searchableComplaints, fuseOptions);
  }, [searchableComplaints, fuseOptions]);

  // Filter complaints based on search term
  const filteredComplaints = useMemo(() => {
    if (!searchTerm.trim()) {
      return complaints;
    }
    
    const results = fuse.search(searchTerm);
    return results.map(result => result.item);
  }, [searchTerm, fuse, complaints]);

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
          <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0">
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <span className="hidden sm:inline">Complaints Management</span>
              <span className="sm:hidden">Complaints</span>
              <span className="text-sm font-normal text-muted-foreground">
                ({filteredComplaints.length} of {complaints.length})
              </span>
            </CardTitle>
            
            {/* Search Bar */}
            <div className="relative w-full lg:w-80">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search complaints..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 pr-10"
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={clearSearch}
                  className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-muted"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
          </div>
          
          {/* Search Results Summary */}
          {searchTerm && (
            <div className="mt-2 text-sm text-muted-foreground">
              {filteredComplaints.length === 0 
                ? `No results for "${searchTerm}"` 
                : `Showing ${filteredComplaints.length} result${filteredComplaints.length === 1 ? '' : 's'} for "${searchTerm}"`
              }
            </div>
          )}
        </CardHeader>
        <CardContent>
          <div className="rounded-md border overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[80px] min-w-[80px]">ID</TableHead>
                    <TableHead className="min-w-[140px]">Location</TableHead>
                    <TableHead className="hidden sm:table-cell min-w-[120px]">
                      Timestamp
                    </TableHead>
                    <TableHead className="min-w-[80px]">Status</TableHead>
                    <TableHead className="text-center min-w-[60px]">
                      Image
                    </TableHead>
                    <TableHead className="text-right min-w-[100px]">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredComplaints.length === 0 ? (
                    <TableRow>
                      <TableCell
                        colSpan={6}
                        className="h-24 text-center text-muted-foreground"
                      >
                        {searchTerm ? (
                          <div className="space-y-2">
                            <p>No complaints found matching "{searchTerm}"</p>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={clearSearch}
                              className="flex items-center gap-2"
                            >
                              <X className="h-3 w-3" />
                              Clear search
                            </Button>
                          </div>
                        ) : (
                          "No complaints found"
                        )}
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredComplaints.map((complaint) => (
                      <TableRow
                        key={complaint.complaintId}
                        className="hover:bg-muted/50"
                      >
                        <TableCell className="font-mono text-xs">
                          <Badge variant="outline" className="font-mono">
                            {complaint.complaintId.slice(-8)}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <MapPin className="h-3 w-3 text-muted-foreground" />
                              <span className="font-mono text-xs">
                                {formatCoordinates(
                                  complaint.latitude,
                                  complaint.longitude
                                )}
                              </span>
                            </div>
                            <div className="sm:hidden flex items-center gap-1 text-xs text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDateTime(complaint.timestamp)}
                            </div>
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
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
                            disabled={true}
                            variant="ghost"
                            size="sm"
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
          </div>
        </CardContent>
      </Card>

      {/* ImagePreviewModal disabled - Feature Coming Soon */}
    </>
  );
};
