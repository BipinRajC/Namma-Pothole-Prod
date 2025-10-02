import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Complaint } from "@/types/complaint";

interface StatusBadgeProps {
  status: Complaint["status"];
  className?: string;
}

const statusConfig = {
  reported: {
    label: "Reported",
    variant: "destructive" as const,
    className: "bg-destructive text-destructive-foreground",
  },
  in_progress: {
    label: "In Progress",
    variant: "default" as const,
    className: "bg-yellow-500 text-white",
  },
  resolved: {
    label: "Resolved",
    variant: "secondary" as const,
    className: "bg-success text-success-foreground",
  },
};

/**
 * Status badge component for complaint status display
 */
export const StatusBadge = ({ status, className }: StatusBadgeProps) => {
  const config = statusConfig[status];

  return (
    <Badge variant={config.variant} className={cn(config.className, className)}>
      {config.label}
    </Badge>
  );
};
