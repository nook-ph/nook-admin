import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

export type OwnerInviteStatus =
  | "sent"
  | "opened"
  | "accepted"
  | "expired"
  | "revoked"
  | "failed"

const STATUS_CONFIG: Record<
  OwnerInviteStatus,
  { label: string; className: string }
> = {
  sent: {
    label: "Sent",
    className:
      "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300 dark:border-blue-800",
  },
  opened: {
    label: "Opened",
    className:
      "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950 dark:text-amber-300 dark:border-amber-800",
  },
  accepted: {
    label: "Accepted",
    className:
      "bg-green-50 text-green-700 border-green-200 dark:bg-green-950 dark:text-green-300 dark:border-green-800",
  },
  expired: {
    label: "Expired",
    className:
      "bg-muted text-muted-foreground border-border",
  },
  revoked: {
    label: "Revoked",
    className:
      "bg-red-50 text-red-700 border-red-200 dark:bg-red-950 dark:text-red-300 dark:border-red-800",
  },
  failed: {
    label: "Failed",
    className:
      "bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950 dark:text-orange-300 dark:border-orange-800",
  },
}

interface InviteStatusBadgeProps {
  status: OwnerInviteStatus
  className?: string
}

export function InviteStatusBadge({ status, className }: InviteStatusBadgeProps) {
  const config = STATUS_CONFIG[status] ?? STATUS_CONFIG.failed
  return (
    <Badge
      variant="outline"
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  )
}
