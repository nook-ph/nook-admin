import { CheckCircle, Clock, Envelope, LockKey, ProhibitInset, ArrowCounterClockwise } from "@phosphor-icons/react/dist/ssr"

interface InviteTimelineProps {
  sent_at: string | null
  opened_at: string | null
  used_at: string | null
  resent_at: string | null
  revoked_at: string | null
}

type TimelineEvent = {
  label: string
  timestamp: string
  icon: React.ReactNode
}

function formatTs(ts: string): string {
  return new Date(ts).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  })
}

export function InviteTimeline({
  sent_at,
  opened_at,
  used_at,
  resent_at,
  revoked_at,
}: InviteTimelineProps) {
  const events: TimelineEvent[] = []

  if (sent_at) {
    events.push({
      label: "Invite sent",
      timestamp: sent_at,
      icon: <Envelope className="size-3.5" />,
    })
  }
  if (resent_at) {
    events.push({
      label: "Invite resent",
      timestamp: resent_at,
      icon: <ArrowCounterClockwise className="size-3.5" />,
    })
  }
  if (opened_at) {
    events.push({
      label: "Password set",
      timestamp: opened_at,
      icon: <LockKey className="size-3.5" />,
    })
  }
  if (used_at) {
    events.push({
      label: "Account activated",
      timestamp: used_at,
      icon: <CheckCircle className="size-3.5" />,
    })
  }
  if (revoked_at) {
    events.push({
      label: "Invite revoked",
      timestamp: revoked_at,
      icon: <ProhibitInset className="size-3.5" />,
    })
  }

  // Sort by timestamp ascending
  events.sort(
    (a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime()
  )

  if (events.length === 0) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <Clock className="size-3.5" />
        <span>No events recorded</span>
      </div>
    )
  }

  return (
    <ol className="flex flex-col gap-2">
      {events.map((event, i) => (
        <li key={i} className="flex items-start gap-2.5 text-xs">
          <span className="mt-0.5 text-muted-foreground shrink-0">{event.icon}</span>
          <span className="font-medium">{event.label}</span>
          <span className="text-muted-foreground ml-auto shrink-0">
            {formatTs(event.timestamp)}
          </span>
        </li>
      ))}
    </ol>
  )
}
