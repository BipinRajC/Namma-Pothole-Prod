import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  RefreshCw,
  MapPin,
  Table as TableIcon,
  AlertTriangle,
  BarChart3,
  Info,
} from "lucide-react";
import { toast } from "@/hooks/use-toast";

import { Complaint } from "@/types/complaint";
import { fetchComplaints, fetchDashboardStats } from "@/services/complaintsApi";
import { StatsCards } from "./StatsCards";
import { ComplaintsTable } from "./ComplaintsTable";
import { PotholeMap } from "./PotholeMap";
import { loadGoogleMaps } from "@/services/googleMapsService";
import { DarkModeToggle } from "./DarkModeToggle";
import { About } from "./About";

/**
 * Main dashboard component for pothole complaint management
 * Combines table view and map view with statistics
 */
export const Dashboard = () => {
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(
    null
  );
  const [activeTab, setActiveTab] = useState<"overview" | "table" | "map" | "about">(
    "overview"
  );
  const [googleMapsLoaded, setGoogleMapsLoaded] = useState(false);

  // Fetch complaints data
  const {
    data: complaintsData,
    isLoading: complaintsLoading,
    error: complaintsError,
    refetch: refetchComplaints,
  } = useQuery({
    queryKey: ["complaints"],
    queryFn: () => fetchComplaints(),
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Fetch dashboard statistics
  const {
    data: statsData,
    isLoading: statsLoading,
    error: statsError,
    refetch: refetchStats,
  } = useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: fetchDashboardStats,
    refetchOnWindowFocus: false,
    retry: 2,
  });

  // Load Google Maps on component mount
  useEffect(() => {
    const initGoogleMaps = async () => {
      try {
        await loadGoogleMaps();
        setGoogleMapsLoaded(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
        // Maps will show an error state instead
        setGoogleMapsLoaded(false);
      }
    };

    if (activeTab === "map" || activeTab === "overview") {
      initGoogleMaps();
    }
  }, [activeTab]);

  // Handle view on map
  const handleViewOnMap = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setActiveTab("map");
  };

  // Handle refresh
  const handleRefresh = async () => {
    try {
      await Promise.all([refetchComplaints(), refetchStats()]);
      toast({
        title: "Data Refreshed",
        description: "All data has been refreshed successfully",
      });
    } catch (error) {
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh data. Please try again.",
        variant: "destructive",
      });
    }
  };

  const complaints = complaintsData?.data || [];
  const stats = statsData || {
    total: 0,
    reported: 0,
    acknowledged: 0,
    resolved: 0,
  };
  const hasError = complaintsError || statsError;

  // Utility function to format coordinates
  const formatCoordinates = (lat: number, lng: number) => {
    return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
  };

  return (
    <div className="min-h-screen bg-dashboard-bg">
      <div className={`container mx-auto ${activeTab === 'map' ? 'p-2 space-y-2' : 'p-6 space-y-6'}`}>
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">
              Pothole Management Dashboard
            </h1>
            <p className="text-muted-foreground mt-1">
              Monitor and manage pothole complaints across Bengaluru
            </p>
          </div>
          <div className="flex items-center gap-2">
            <DarkModeToggle />
            <Button
              onClick={handleRefresh}
              disabled={complaintsLoading || statsLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  complaintsLoading || statsLoading ? "animate-spin" : ""
                }`}
              />
              Refresh Data
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              {complaintsError?.message ||
                statsError?.message ||
                "Failed to load data"}
              <Button
                variant="outline"
                size="sm"
                className="ml-2"
                onClick={handleRefresh}
              >
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Dashboard Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={(value) =>
            setActiveTab(value as "overview" | "table" | "map" | "about")
          }
        >
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Overview
            </TabsTrigger>
            <TabsTrigger value="table" className="flex items-center gap-2">
              <TableIcon className="h-4 w-4" />
              Complaints Table
            </TabsTrigger>
            <TabsTrigger value="map" className="flex items-center gap-2">
              <MapPin className="h-4 w-4" />
              Map View
            </TabsTrigger>
            <TabsTrigger value="about" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              About
            </TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            {/* Statistics Cards */}
            <StatsCards stats={stats} isLoading={statsLoading} />

            {/* Recent Complaints & Map Preview */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Complaints */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TableIcon className="h-5 w-5" />
                    Recent Complaints
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {complaintsLoading ? (
                    <div className="space-y-3">
                      {Array.from({ length: 3 }).map((_, i) => (
                        <div
                          key={i}
                          className="flex items-center space-x-4 animate-pulse"
                        >
                          <div className="h-4 bg-muted rounded w-20"></div>
                          <div className="h-4 bg-muted rounded w-32"></div>
                          <div className="h-4 bg-muted rounded w-24"></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {complaints.slice(0, 5).map((complaint) => (
                        <div
                          key={complaint._id}
                          className="flex items-center justify-between p-3 bg-muted/50 rounded-lg hover:bg-muted cursor-pointer transition-colors"
                          onClick={() => handleViewOnMap(complaint)}
                        >
                          <div className="flex items-center gap-3">
                            <div className="text-xs font-mono text-muted-foreground">
                              {complaint._id.slice(-8)}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {formatCoordinates(
                                complaint.latitude,
                                complaint.longitude
                              )}
                            </div>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {new Date(complaint.timestamp).toLocaleDateString(
                              "en-IN"
                            )}
                          </div>
                        </div>
                      ))}
                      {complaints.length === 0 && (
                        <div className="text-center text-muted-foreground py-4">
                          No complaints available
                        </div>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Map Preview */}
              <PotholeMap
                complaints={complaints.slice(0, 10)} // Show limited markers for overview
                selectedComplaint={selectedComplaint}
                onComplaintSelect={setSelectedComplaint}
                isLoading={complaintsLoading}
                isFullScreen={false}
              />
            </div>
          </TabsContent>

          {/* Table Tab */}
          <TabsContent value="table">
            <ComplaintsTable
              complaints={complaints}
              isLoading={complaintsLoading}
              onViewOnMap={handleViewOnMap}
            />
          </TabsContent>

          {/* Map Tab */}
          <TabsContent value="map" className="mt-2">
            <PotholeMap
              complaints={complaints}
              selectedComplaint={selectedComplaint}
              onComplaintSelect={setSelectedComplaint}
              isLoading={complaintsLoading}
              isFullScreen={true}
            />
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about" className="mt-6">
            <About />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};
