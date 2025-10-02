import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  LogOut,
  RefreshCw,
  Upload,
  X,
  CheckCircle,
  AlertCircle,
  FileText,
  MapPin,
  Calendar,
  BarChart3,
  Table as TableIcon,
  Map as MapIcon,
  TrendingUp,
  Activity,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";
import {
  getCurrentAdmin,
  adminLogout,
  getAdminComplaints,
  updateComplaintStatus,
  uploadEvidence,
  getAdminStats,
  isAuthenticated,
} from "@/services/adminApi";
import { Complaint } from "@/types/complaint";
import { StatusBadge } from "@/components/StatusBadge";
import { ImagePreviewModal } from "@/components/ImagePreviewModal";
import { PotholeMap } from "@/components/PotholeMap";
import { loadGoogleMaps } from "@/services/googleMapsService";

/**
 * Evidence Upload Component with Drag & Drop
 */
interface EvidenceUploadProps {
  complaintId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

const EvidenceUpload = ({
  complaintId,
  onSuccess,
  onCancel,
}: EvidenceUploadProps) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadEvidence(complaintId, file),
    onSuccess: () => {
      toast({
        title: "Evidence Uploaded",
        description: "Complaint has been marked as resolved successfully!",
      });
      onSuccess();
    },
    onError: (error: Error) => {
      toast({
        title: "Upload Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleFileSelect = (file: File) => {
    // Validate file type
    if (!["image/jpeg", "image/jpg", "image/png"].includes(file.type)) {
      toast({
        title: "Invalid File Type",
        description: "Please upload a JPEG, JPG, or PNG image.",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (1MB limit)
    if (file.size > 1024 * 1024) {
      toast({
        title: "File Too Large",
        description: "Please upload an image smaller than 1MB.",
        variant: "destructive",
      });
      return;
    }

    setSelectedFile(file);

    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFileSelect(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleUpload = () => {
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  return (
    <div className="space-y-4">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
          isDragging
            ? "border-blue-500 bg-blue-50 dark:bg-blue-950"
            : "border-gray-300 dark:border-gray-700"
        }`}
      >
        {preview ? (
          <div className="space-y-4">
            <img
              src={preview}
              alt="Preview"
              className="max-h-64 mx-auto rounded-lg"
            />
            <div className="flex items-center justify-center gap-2">
              <p className="text-sm text-muted-foreground">
                {selectedFile?.name}
              </p>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setSelectedFile(null);
                  setPreview(null);
                }}
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <Upload className="h-12 w-12 mx-auto text-muted-foreground" />
            <div>
              <p className="text-lg font-medium">
                Drag & drop evidence image here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                or click to browse
              </p>
            </div>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleFileSelect(file);
              }}
              className="hidden"
              id="file-upload"
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("file-upload")?.click()}
            >
              Browse Files
            </Button>
            <p className="text-xs text-muted-foreground">
              Accepted: JPEG, JPG, PNG • Max size: 1MB
            </p>
          </div>
        )}
      </div>

      {uploadMutation.isPending && (
        <div className="space-y-2">
          <Progress value={uploadProgress} />
          <p className="text-sm text-center text-muted-foreground">
            Uploading evidence...
          </p>
        </div>
      )}

      <div className="flex gap-2">
        <Button
          onClick={handleUpload}
          disabled={!selectedFile || uploadMutation.isPending}
          className="flex-1"
        >
          {uploadMutation.isPending ? "Uploading..." : "Upload & Mark Resolved"}
        </Button>
        <Button variant="outline" onClick={onCancel} disabled={uploadMutation.isPending}>
          Cancel
        </Button>
      </div>
    </div>
  );
};

/**
 * Admin Dashboard Component
 */
export default function AdminDashboard() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [showEvidenceUpload, setShowEvidenceUpload] = useState(false);
  const [showImagePreview, setShowImagePreview] = useState(false);
  const [previewImageUrl, setPreviewImageUrl] = useState("");
  const [previewComplaintId, setPreviewComplaintId] = useState("");
  const [activeTab, setActiveTab] = useState<"overview" | "complaints" | "map">("overview");
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  const adminUser = getCurrentAdmin();

  // Load Google Maps on component mount
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        setGoogleMapsLoaded(false);
      }
    };

    if (activeTab === "map" || activeTab === "overview") {
      initGoogleMaps();
    }
  }, [activeTab]);

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!isAuthenticated() || !adminUser) {
      navigate("/admin/login");
    }
  }, [navigate, adminUser]);

  // Fetch complaints
  const {
    data: complaintsData,
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useQuery({
    queryKey: ["admin-complaints"],
    queryFn: getAdminComplaints,
    refetchOnWindowFocus: false,
    enabled: !!adminUser,
  });

  // Fetch stats
  const {
    data: statsData,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["admin-stats"],
    queryFn: getAdminStats,
    refetchOnWindowFocus: false,
    enabled: !!adminUser,
  });

  // Status update mutation
  const statusUpdateMutation = useMutation({
    mutationFn: ({
      complaintId,
      status,
    }: {
      complaintId: string;
      status: "reported" | "in_progress" | "resolved";
    }) => updateComplaintStatus(complaintId, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
      queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
      toast({
        title: "Status Updated",
        description: "Complaint status has been updated successfully!",
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Update Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleRefresh = async () => {
    await Promise.all([refetchComplaints(), refetchStats()]);
    toast({
      title: "Data Refreshed",
      description: "Dashboard data has been updated.",
    });
  };

  const handleStatusChange = (complaintId: string, newStatus: string) => {
    if (newStatus === "resolved") {
      // For resolved, require evidence upload
      const complaint = complaintsData?.data.find(
        (c) => c.complaintId === complaintId
      );
      setSelectedComplaint(complaint || null);
      setShowEvidenceUpload(true);
    } else {
      statusUpdateMutation.mutate({
        complaintId,
        status: newStatus as "reported" | "in_progress",
      });
    }
  };

  const handleEvidenceUploadSuccess = () => {
    setShowEvidenceUpload(false);
    setSelectedComplaint(null);
    queryClient.invalidateQueries({ queryKey: ["admin-complaints"] });
    queryClient.invalidateQueries({ queryKey: ["admin-stats"] });
  };

  const handleImageClick = (url: string, complaintId: string) => {
    setPreviewImageUrl(url);
    setPreviewComplaintId(complaintId);
    setShowImagePreview(true);
  };

  const formatDate = (timestamp: string) => {
    return new Date(parseInt(timestamp) * 1000).toLocaleString();
  };

  if (!adminUser) {
    return null;
  }

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className="container mx-auto px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold">Admin Dashboard</h1>
            <p className="text-muted-foreground mt-1">
              Welcome, {adminUser.name}
              {adminUser.zone && ` • ${adminUser.zone}`}
            </p>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRefresh}
              disabled={complaintsLoading}
            >
              <RefreshCw
                className={`h-4 w-4 mr-2 ${
                  complaintsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={adminLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {complaintsError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {(complaintsError as Error).message}
            </AlertDescription>
          </Alert>
        )}

        {/* Tabs */}
        <Tabs value={activeTab} onValueChange={(value: any) => setActiveTab(value)} className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Statistics</span>
            </TabsTrigger>
            <TabsTrigger value="complaints" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Complaints</span>
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Map</span>
            </TabsTrigger>
          </TabsList>

          {/* Statistics Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Summary Cards */}
            {statsData && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <Card className="border-2 border-blue-200 dark:border-blue-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Total Complaints
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold">
                      {statsData.stats.total}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      All time in your zone
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-red-200 dark:border-red-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <AlertCircle className="h-4 w-4" />
                      Reported
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-red-600">
                      {statsData.stats.reported}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statsData.stats.total > 0
                        ? `${((statsData.stats.reported / statsData.stats.total) * 100).toFixed(1)}% of total`
                        : "No data"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-yellow-200 dark:border-yellow-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <Activity className="h-4 w-4" />
                      In Progress
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-yellow-600">
                      {statsData.stats.inProgress}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statsData.stats.total > 0
                        ? `${((statsData.stats.inProgress / statsData.stats.total) * 100).toFixed(1)}% of total`
                        : "No data"}
                    </p>
                  </CardContent>
                </Card>
                <Card className="border-2 border-green-200 dark:border-green-900">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                      <CheckCircle className="h-4 w-4" />
                      Resolved
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-green-600">
                      {statsData.stats.resolved}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {statsData.stats.total > 0
                        ? `${((statsData.stats.resolved / statsData.stats.total) * 100).toFixed(1)}% of total`
                        : "No data"}
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Progress Overview */}
            {statsData && statsData.stats.total > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Completion Progress</CardTitle>
                  <CardDescription>
                    Track the resolution rate for your zone
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Reported</span>
                      <span className="font-medium">{statsData.stats.reported}</span>
                    </div>
                    <Progress
                      value={(statsData.stats.reported / statsData.stats.total) * 100}
                      className="h-2 bg-red-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">In Progress</span>
                      <span className="font-medium">{statsData.stats.inProgress}</span>
                    </div>
                    <Progress
                      value={(statsData.stats.inProgress / statsData.stats.total) * 100}
                      className="h-2 bg-yellow-100"
                    />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-muted-foreground">Resolved</span>
                      <span className="font-medium">{statsData.stats.resolved}</span>
                    </div>
                    <Progress
                      value={(statsData.stats.resolved / statsData.stats.total) * 100}
                      className="h-2 bg-green-100"
                    />
                  </div>
                  <div className="pt-4 border-t">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-green-600" />
                        <span className="font-medium">Resolution Rate</span>
                      </div>
                      <span className="text-2xl font-bold text-green-600">
                        {((statsData.stats.resolved / statsData.stats.total) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Zone Breakdown for Superintendent */}
            {adminUser.role === "superintendent_engineer" && statsData?.zoneBreakdown && (
              <Card>
                <CardHeader>
                  <CardTitle>Zone-wise Breakdown</CardTitle>
                  <CardDescription>
                    Complaints distribution across all zones
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {statsData.zoneBreakdown.map((zone) => (
                      <div key={zone.zoneId} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="font-medium">{zone.zone}</span>
                          <span className="text-sm text-muted-foreground">
                            {zone.total} complaints
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2 text-xs">
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-red-500"></div>
                            <span>{zone.reported} Reported</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-yellow-500"></div>
                            <span>{zone.inProgress} In Progress</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 rounded-full bg-green-500"></div>
                            <span>{zone.resolved} Resolved</span>
                          </div>
                        </div>
                        <Progress
                          value={(zone.resolved / zone.total) * 100}
                          className="h-1"
                        />
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Complaints Tab */}
          <TabsContent value="complaints" className="space-y-6">
            <Card>
          <CardHeader>
            <CardTitle>Complaints</CardTitle>
            <CardDescription>
              {complaintsData?.zone === "all"
                ? "All zones"
                : `Zone: ${adminUser.zone}`}
              {" • "}
              {complaintsData?.data.length || 0} complaints
            </CardDescription>
          </CardHeader>
          <CardContent>
            {complaintsLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="animate-pulse">
                    <div className="h-24 bg-muted rounded"></div>
                  </div>
                ))}
              </div>
            ) : complaintsData?.data.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No complaints found in your zone</p>
              </div>
            ) : (
              <div className="space-y-4">
                {complaintsData?.data.map((complaint) => (
                  <Card key={complaint.complaintId} className="border-2">
                    <CardContent className="pt-6">
                      <div className="flex flex-col md:flex-row gap-4">
                        {/* Image */}
                        <div className="flex-shrink-0">
                          <img
                            src={complaint.imageUrl}
                            alt="Pothole"
                            className="w-full md:w-32 h-32 object-cover rounded-lg cursor-pointer hover:opacity-80 transition-opacity"
                            onClick={() => handleImageClick(complaint.imageUrl, complaint.complaintId)}
                          />
                        </div>

                        {/* Details */}
                        <div className="flex-grow space-y-2">
                          <div className="flex items-start justify-between">
                            <div>
                              <p className="font-mono text-sm text-muted-foreground">
                                {complaint.complaintId}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <StatusBadge status={complaint.status} />
                                {complaint.zone && (
                                  <Badge variant="outline">{complaint.zone}</Badge>
                                )}
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <MapPin className="h-4 w-4" />
                            <span>
                              {complaint.latitude.toFixed(4)},{" "}
                              {complaint.longitude.toFixed(4)}
                            </span>
                          </div>

                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            <span>{formatDate(complaint.timestamp)}</span>
                          </div>

                          {complaint.evidenceUrl && (
                            <div className="pt-2">
                              <p className="text-sm font-medium mb-2">
                                Evidence (Fixed):
                              </p>
                              <img
                                src={complaint.evidenceUrl}
                                alt="Evidence"
                                className="w-24 h-24 object-cover rounded cursor-pointer hover:opacity-80 transition-opacity"
                                onClick={() =>
                                  handleImageClick(complaint.evidenceUrl!, complaint.complaintId)
                                }
                              />
                            </div>
                          )}

                          {/* Action Buttons */}
                          <div className="flex gap-2 pt-2">
                            {complaint.status === "reported" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    complaint.complaintId,
                                    "in_progress"
                                  )
                                }
                                disabled={statusUpdateMutation.isPending}
                              >
                                Mark In Progress
                              </Button>
                            )}
                            {complaint.status === "in_progress" && (
                              <Button
                                size="sm"
                                onClick={() =>
                                  handleStatusChange(
                                    complaint.complaintId,
                                    "resolved"
                                  )
                                }
                                disabled={statusUpdateMutation.isPending}
                              >
                                <CheckCircle className="h-4 w-4 mr-2" />
                                Upload Evidence & Resolve
                              </Button>
                            )}
                            {complaint.status === "resolved" && (
                              <Badge variant="secondary" className="gap-1">
                                <CheckCircle className="h-3 w-3" />
                                Resolved
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="space-y-4">
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Pothole Locations Map</CardTitle>
                    <CardDescription className="mt-1">
                      Interactive map showing pothole locations
                      {adminUser.zone && ` in ${adminUser.zone}`}
                    </CardDescription>
                  </div>
                  {complaintsData && (
                    <Badge variant="secondary" className="text-sm">
                      {complaintsData.data.length} complaints
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-0">
                {complaintsData && complaintsData.data.length > 0 ? (
                  <div className="h-[500px] md:h-[600px] lg:h-[700px] w-full">
                    {googleMapsLoaded ? (
                      <PotholeMap
                        complaints={complaintsData.data}
                        onMarkerClick={(complaint) => {
                          setSelectedComplaint(complaint);
                        }}
                        selectedComplaint={selectedComplaint}
                      />
                    ) : (
                      <div className="h-full flex items-center justify-center bg-muted">
                        <div className="text-center space-y-2">
                          <MapIcon className="h-12 w-12 mx-auto text-muted-foreground animate-pulse" />
                          <p className="text-muted-foreground">Loading map...</p>
                        </div>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="h-[500px] md:h-[600px] lg:h-[700px] flex items-center justify-center bg-muted">
                    <div className="text-center space-y-2">
                      <MapPin className="h-12 w-12 mx-auto text-muted-foreground" />
                      <p className="text-muted-foreground">No complaints to display on map</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Selected Complaint Details */}
            {selectedComplaint && (
              <Card>
                <CardHeader>
                  <CardTitle>Selected Complaint Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex gap-4">
                    <img
                      src={selectedComplaint.imageUrl}
                      alt="Pothole"
                      className="w-32 h-32 object-cover rounded-lg cursor-pointer"
                      onClick={() => handleImageClick(selectedComplaint.imageUrl, selectedComplaint.complaintId)}
                    />
                    <div className="flex-grow space-y-2">
                      <div className="flex items-center gap-2">
                        <StatusBadge status={selectedComplaint.status} />
                        {selectedComplaint.zone && (
                          <Badge variant="outline">{selectedComplaint.zone}</Badge>
                        )}
                      </div>
                      <p className="font-mono text-sm text-muted-foreground">
                        {selectedComplaint.complaintId}
                      </p>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {selectedComplaint.latitude.toFixed(4)},{" "}
                          {selectedComplaint.longitude.toFixed(4)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>{formatDate(selectedComplaint.timestamp)}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {selectedComplaint.status === "reported" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(
                            selectedComplaint.complaintId,
                            "in_progress"
                          )
                        }
                        disabled={statusUpdateMutation.isPending}
                      >
                        Mark In Progress
                      </Button>
                    )}
                    {selectedComplaint.status === "in_progress" && (
                      <Button
                        size="sm"
                        onClick={() =>
                          handleStatusChange(
                            selectedComplaint.complaintId,
                            "resolved"
                          )
                        }
                        disabled={statusUpdateMutation.isPending}
                      >
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Upload Evidence & Resolve
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Evidence Upload Dialog */}
      <Dialog open={showEvidenceUpload} onOpenChange={setShowEvidenceUpload}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Upload Evidence & Mark as Resolved</DialogTitle>
            <DialogDescription>
              Upload an image showing the repaired pothole. Complaint will be
              automatically marked as resolved.
            </DialogDescription>
          </DialogHeader>
          {selectedComplaint && (
            <EvidenceUpload
              complaintId={selectedComplaint.complaintId}
              onSuccess={handleEvidenceUploadSuccess}
              onCancel={() => {
                setShowEvidenceUpload(false);
                setSelectedComplaint(null);
              }}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Image Preview Modal */}
      <ImagePreviewModal
        isOpen={showImagePreview}
        onClose={() => setShowImagePreview(false)}
        imageUrl={previewImageUrl}
        complaintId={previewComplaintId}
      />
    </div>
  );
}

