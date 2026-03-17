"use client"

import {
  ChatCircle,
  PencilSimple,
  Storefront,
  UserCircle,
} from "@phosphor-icons/react"
import { type Icon } from "@phosphor-icons/react"

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

interface ActivityItem {
  icon: Icon
  description: string
  timestamp: string
}

const activityFeed: ActivityItem[] = [
  {
    icon: Storefront,
    description: "Slowpoke Coffee was published",
    timestamp: "2 mins ago",
  },
  {
    icon: UserCircle,
    description: "Owner account created for Abaca Coffee",
    timestamp: "1 hr ago",
  },
  {
    icon: UserCircle,
    description: "Cafe Laguna owner logged in for the first time",
    timestamp: "2 hrs ago",
  },
  {
    icon: ChatCircle,
    description: "@jana_c left a 5-star review for The Grind",
    timestamp: "3 hrs ago",
  },
  {
    icon: Storefront,
    description: "Casa Breva was set to inactive",
    timestamp: "Yesterday",
  },
  {
    icon: PencilSimple,
    description: "IT Park Brew owner updated operating hours",
    timestamp: "Yesterday",
  },
  {
    icon: Storefront,
    description: "Brewlab was published",
    timestamp: "2 days ago",
  },
  {
    icon: UserCircle,
    description: "Owner account created for Coffee Madness",
    timestamp: "3 days ago",
  },
]

export function RecentActivity() {
  return (
    <Card className="lg:col-span-2">
      <CardHeader className="border-b">
        <CardTitle>Recent Activity</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        {activityFeed.map((item, index) => {
          const Icon = item.icon
          return (
            <div
              key={index}
              className="flex items-center gap-3 border-b px-4 py-3 last:border-0"
            >
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted">
                <Icon className="size-4 text-muted-foreground" />
              </div>
              <p className="flex-1 text-sm">{item.description}</p>
              <span className="shrink-0 text-xs text-muted-foreground">
                {item.timestamp}
              </span>
            </div>
          )
        })}
      </CardContent>
    </Card>
  )
}
