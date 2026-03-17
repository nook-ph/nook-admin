"use client"

import Link from "next/link"
import {
  CalendarBlank,
  ChartBar,
  ChatCircle,
  CheckCircle,
  Clock,
  Eye,
  Heart,
  Image,
  Images,
  MapPin,
  PencilSimple,
  Star,
  Tag,
} from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

const reviews = [
  {
    name: "Jana Cruz",
    initials: "JC",
    rating: 5,
    date: "2 days ago",
    content: "Best pour over in Cebu. Absolutely love this place.",
  },
  {
    name: "Marco Reyes",
    initials: "MR",
    rating: 4,
    date: "4 days ago",
    content: "Great atmosphere for solo work. WiFi is fast.",
  },
  {
    name: "Bea Santos",
    initials: "BS",
    rating: 5,
    date: "1 week ago",
    content: "Hidden gem in IT Park. Consistently good.",
  },
  {
    name: "Kobe Tan",
    initials: "KT",
    rating: 3,
    date: "2 weeks ago",
    content: "Good coffee but the wait was a bit long.",
  },
  {
    name: "Trish V",
    initials: "TV",
    rating: 5,
    date: "3 weeks ago",
    content: "The baristas are so knowledgeable about origins.",
  },
]

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <Star key={i} size={12} weight="fill" className="text-yellow-400" />
        ) : (
          <Star key={i} size={12} className="text-muted-foreground" />
        )
      )}
    </div>
  )
}

export default function OwnerDashboardPage() {
  return (
    <div className="w-full mx-auto px-6 py-8 space-y-6">

      {/* Section 1 — Listing Status Banner */}
      <div className="flex items-center gap-3 rounded-lg border border-green-200 bg-green-50 px-4 py-3 dark:border-green-800 dark:bg-green-950">
        <CheckCircle
          size={20}
          className="text-green-600 dark:text-green-400 shrink-0"
        />
        <div className="flex flex-col gap-0.5">
          <p className="text-sm font-medium text-green-900 dark:text-green-100">
            Your listing is live on Nook
          </p>
          <p className="text-xs text-green-700 dark:text-green-300">
            Users can find you on the map and in search.
          </p>
        </div>
      </div>

      {/* Section 2 — Stats Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card>
          <CardHeader>
            <CardDescription>Total Reviews</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              32
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <ChatCircle />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Average Rating</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              4.9 ★
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Star />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Times Saved</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              148
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Heart />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>

        <Card>
          <CardHeader>
            <CardDescription>Profile Views</CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums">
              —
            </CardTitle>
            <CardAction>
              <Badge variant="outline">
                <Eye />
              </Badge>
            </CardAction>
          </CardHeader>
        </Card>
      </div>

      {/* Section 3 — Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* Left Column */}
        <div className="lg:col-span-2 flex flex-col gap-6">

          {/* Quick Actions Card */}
          <Card>
            <CardHeader>
              <CardTitle>Quick actions</CardTitle>
              <CardDescription>
                Common tasks for managing your listing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/profile">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <PencilSimple size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Edit Listing</span>
                      <span className="text-xs text-muted-foreground">
                        Update description and hours
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/photos">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Images size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Manage Photos</span>
                      <span className="text-xs text-muted-foreground">
                        Upload and reorder photos
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/profile">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Clock size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Update Hours</span>
                      <span className="text-xs text-muted-foreground">
                        Change your opening times
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/reviews">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <ChatCircle size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">View Reviews</span>
                      <span className="text-xs text-muted-foreground">
                        See what customers are saying
                      </span>
                    </div>
                  </Link>
                </Button>

                <Button
                  variant="outline"
                  className="sm:col-span-2 justify-start gap-3 h-auto py-3 px-4"
                  asChild
                >
                  <Link href="/owner/preview">
                    <div className="size-8 rounded-md bg-muted flex items-center justify-center shrink-0">
                      <Eye size={16} className="text-muted-foreground" />
                    </div>
                    <div className="flex flex-col items-start gap-0.5">
                      <span className="text-sm font-medium">Preview Listing</span>
                      <span className="text-xs text-muted-foreground">
                        See how your cafe looks in the app
                      </span>
                    </div>
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Recent Reviews Card */}
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Recent reviews</CardTitle>
                  <CardDescription>
                    reviews.content — last 5 reviews
                  </CardDescription>
                </div>
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/owner/reviews">View all →</Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-0">
              {reviews.map((review) => (
                <div
                  key={review.name}
                  className="flex flex-row items-start gap-3 py-3 border-b last:border-0"
                >
                  <div className="size-8 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {review.initials}
                  </div>
                  <div className="flex flex-col flex-1 gap-1">
                    <div className="flex flex-row items-center justify-between">
                      <span className="text-sm font-medium">{review.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {review.date}
                      </span>
                    </div>
                    <StarRating rating={review.rating} />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {review.content}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Right Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">

          {/* Listing Info Card */}
          <Card>
            <CardHeader>
              <CardTitle>Your listing</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center text-muted-foreground border">
                <Image size={24} />
                <p className="text-xs mt-1">featured_image_url</p>
              </div>

              <div className="flex flex-col gap-1">
                <p className="text-sm font-semibold">Slowpoke Coffee</p>
                <div className="flex flex-row items-center gap-1.5">
                  <MapPin size={12} className="text-muted-foreground" />
                  <p className="text-xs text-muted-foreground">
                    IT Park, Cebu City
                  </p>
                </div>
                <div className="flex flex-row items-center gap-1.5 mt-0.5">
                  <div className="flex flex-row items-center gap-0.5">
                    <Star size={12} weight="fill" className="text-yellow-400" />
                    <span className="text-xs font-medium">4.9</span>
                  </div>
                  <span className="text-xs text-muted-foreground">
                    (32 reviews)
                  </span>
                </div>
              </div>

              <Separator />

              <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-muted-foreground">Status</span>
                <div className="flex items-center gap-1.5">
                  <div className="size-1.5 rounded-full bg-green-500" />
                  <span className="text-xs font-medium">Active</span>
                </div>
              </div>

              <div className="flex flex-row justify-between items-center">
                <span className="text-xs text-muted-foreground">
                  Last updated
                </span>
                <span className="text-xs">2 days ago</span>
              </div>

              <Button
                variant="outline"
                size="sm"
                className="w-full mt-2"
                asChild
              >
                <Link href="/owner/profile">
                  <PencilSimple size={14} />
                  Edit listing
                </Link>
              </Button>
            </CardContent>
          </Card>

          {/* Phase 3 Coming Soon Card */}
          <Card className="border-dashed">
            <CardHeader>
              <CardTitle className="text-base">Coming in Phase 3</CardTitle>
              <CardDescription>More tools to grow your cafe</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <ChartBar size={16} className="shrink-0" />
                Full analytics dashboard
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <Tag size={16} className="shrink-0" />
                Vouchers &amp; deals
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground py-1">
                <CalendarBlank size={16} className="shrink-0" />
                Event promotion
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
