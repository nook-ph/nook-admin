"use client"

import {
  ChatCircle,
  IdentificationBadge,
  Storefront,
  UserCircleDashed,
  Users,
  WarningCircle,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardAction,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"

export function SectionCards() {
  return (
    <div className="grid grid-cols-1 gap-4 *:data-[slot=card]:bg-gradient-to-t *:data-[slot=card]:from-primary/5 *:data-[slot=card]:to-card *:data-[slot=card]:shadow-xs sm:grid-cols-2 xl:grid-cols-3 dark:*:data-[slot=card]:bg-card">
      <Card>
        <CardHeader>
          <CardDescription>Total Cafes</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            24
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Storefront />
              24
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Active listings on the platform <Storefront className="size-4" />
          </div>
          <div className="text-muted-foreground">Published and draft cafes</div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Unclaimed Listings</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            8
          </CardTitle>
          <CardAction>
            <Badge variant="destructive">
              <WarningCircle />8
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Cafes without an owner account{" "}
            <WarningCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Needs an owner account created
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Total App Users</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            1,280
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <Users />
              1,280
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Registered users on the app <Users className="size-4" />
          </div>
          <div className="text-muted-foreground">
            All accounts across the platform
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Active Owners</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            18
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <IdentificationBadge />
              18
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Owners with portal access{" "}
            <IdentificationBadge className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Linked to at least one cafe
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Reviews This Week</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            43
          </CardTitle>
          <CardAction>
            <Badge variant="outline">
              <ChatCircle />
              43
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Community engagement signal <ChatCircle className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Reviews posted in the last 7 days
          </div>
        </CardFooter>
      </Card>

      <Card>
        <CardHeader>
          <CardDescription>Owners Never Logged In</CardDescription>
          <CardTitle className="text-2xl font-semibold tabular-nums sm:text-3xl">
            3
          </CardTitle>
          <CardAction>
            <Badge variant="destructive">
              <UserCircleDashed />3
            </Badge>
          </CardAction>
        </CardHeader>
        <CardFooter className="flex-col items-start gap-1.5 text-sm">
          <div className="line-clamp-1 flex gap-2 font-medium">
            Follow up with these owners{" "}
            <UserCircleDashed className="size-4" />
          </div>
          <div className="text-muted-foreground">
            Sent credentials but never accessed portal
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}
