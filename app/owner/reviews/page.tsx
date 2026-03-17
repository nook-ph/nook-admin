"use client"

import * as React from "react"
import {
  ChatCircle,
  Flag,
  MagnifyingGlass,
  Star,
} from "@phosphor-icons/react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { Button } from "@/components/ui/button"

type Review = {
  id: string
  fullName: string
  username: string
  initials: string
  rating: number
  date: string
  content: string
}

const REVIEWS: Review[] = [
  {
    id: "1",
    fullName: "Jana Cruz",
    username: "@jana_cruz",
    initials: "JC",
    rating: 5,
    date: "2 days ago",
    content:
      "Best pour over in Cebu. The Ethiopia Yirgacheffe was exceptional — floral, bright, and perfectly extracted. Will definitely be back.",
  },
  {
    id: "2",
    fullName: "Marco Reyes",
    username: "@marco_r",
    initials: "MR",
    rating: 4,
    date: "4 days ago",
    content:
      "Great atmosphere for solo work. WiFi is fast and the baristas are knowledgeable about the beans.",
  },
  {
    id: "3",
    fullName: "Bea Santos",
    username: "@bea_s",
    initials: "BS",
    rating: 5,
    date: "1 week ago",
    content:
      "Hidden gem in IT Park. The space is beautiful and the coffee is consistently good every single visit.",
  },
  {
    id: "4",
    fullName: "Kobe Tan",
    username: "@kobetan",
    initials: "KT",
    rating: 3,
    date: "2 weeks ago",
    content:
      "Good coffee but service was slow on my visit. The iced americano was solid though.",
  },
  {
    id: "5",
    fullName: "Trish Villanueva",
    username: "@trishv",
    initials: "TV",
    rating: 5,
    date: "3 weeks ago",
    content:
      "The baristas are so knowledgeable about coffee origins. Genuinely one of the best in the city.",
  },
  {
    id: "6",
    fullName: "Nico Lim",
    username: "@nico_l",
    initials: "NL",
    rating: 4,
    date: "1 month ago",
    content:
      "Love the minimalist vibe. Good for dates and quiet work sessions. Oat milk is always fresh.",
  },
  {
    id: "7",
    fullName: "Ana Reyes",
    username: "@ana_r",
    initials: "AR",
    rating: 5,
    date: "1 month ago",
    content:
      "First time here and I'm already planning my return. The pour over was outstanding.",
  },
]

const RATING_BREAKDOWN = [
  { stars: 5, pct: 70, count: 22 },
  { stars: 4, pct: 15, count: 5  },
  { stars: 3, pct: 10, count: 3  },
  { stars: 2, pct: 3,  count: 1  },
  { stars: 1, pct: 2,  count: 1  },
]

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex flex-row gap-0.5 items-center">
      {Array.from({ length: 5 }).map((_, i) =>
        i < rating ? (
          <Star key={i} size={14} weight="fill" className="text-yellow-400" />
        ) : (
          <Star key={i} size={14} className="text-muted-foreground" />
        )
      )}
    </div>
  )
}

export default function OwnerReviewsPage() {
  const [search, setSearch] = React.useState("")
  const [ratingFilter, setRatingFilter] = React.useState("all")
  const [sort, setSort] = React.useState("recent")
  const [reportReview, setReportReview] = React.useState<string | null>(null)

  const filtered = React.useMemo(() => {
    let list = [...REVIEWS]

    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (r) =>
          r.fullName.toLowerCase().includes(q) ||
          r.content.toLowerCase().includes(q)
      )
    }

    if (ratingFilter !== "all") {
      const n = parseInt(ratingFilter)
      list = list.filter((r) => r.rating === n)
    }

    if (sort === "highest") list.sort((a, b) => b.rating - a.rating)
    else if (sort === "lowest") list.sort((a, b) => a.rating - b.rating)

    return list
  }, [search, ratingFilter, sort])

  return (
    <>
      <div className="w-full mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold">Reviews</h1>
          <p className="text-sm text-muted-foreground">
            All reviews for your cafe — read-only in Phase 1
          </p>
        </div>

        {/* Phase 3 Banner */}
        <div className="flex items-center gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-800 dark:bg-amber-950">
          <ChatCircle
            size={16}
            className="text-amber-600 dark:text-amber-400 shrink-0"
          />
          <p className="text-sm text-amber-800 dark:text-amber-200">
            Review responses are coming in Phase 3 — you&apos;ll be able to
            reply publicly to every review.
          </p>
        </div>

        {/* Summary Card */}
        <Card>
          <CardContent className="pt-5 pb-5">
            <div className="flex flex-row items-center gap-6">

              {/* Overall rating */}
              <div className="flex flex-col items-center gap-1 shrink-0">
                <span className="text-4xl font-bold">4.9</span>
                <div className="flex flex-row gap-0.5">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      weight="fill"
                      className="text-yellow-400"
                    />
                  ))}
                </div>
                <span className="text-sm text-muted-foreground">32 reviews</span>
              </div>

              <Separator orientation="vertical" className="h-20" />

              {/* Breakdown */}
              <div className="flex-1 space-y-1.5">
                {RATING_BREAKDOWN.map(({ stars, pct, count }) => (
                  <div key={stars} className="flex items-center gap-3">
                    <div className="flex flex-row items-center gap-0.5 w-16 shrink-0">
                      <span className="text-xs text-muted-foreground">{stars}</span>
                      <Star size={12} className="text-yellow-400" />
                    </div>
                    <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-yellow-400 rounded-full"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground w-4 text-right shrink-0">
                      {count}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Filters Bar */}
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <div className="relative flex-1 min-w-[200px]">
            <MagnifyingGlass
              size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              placeholder="Search reviews..."
              className="pl-8"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <Select value={ratingFilter} onValueChange={setRatingFilter}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="All ratings" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ratings</SelectItem>
              <SelectItem value="5">5 stars</SelectItem>
              <SelectItem value="4">4 stars</SelectItem>
              <SelectItem value="3">3 stars</SelectItem>
              <SelectItem value="2">2 stars</SelectItem>
              <SelectItem value="1">1 star</SelectItem>
            </SelectContent>
          </Select>

          <Select value={sort} onValueChange={setSort}>
            <SelectTrigger className="w-[160px]">
              <SelectValue placeholder="Most recent" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="recent">Most recent</SelectItem>
              <SelectItem value="highest">Highest rated</SelectItem>
              <SelectItem value="lowest">Lowest rated</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Reviews List Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <CardTitle>All reviews</CardTitle>
              <Badge variant="secondary">32 total</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-0 p-0">
            {filtered.length === 0 ? (
              <p className="text-sm text-muted-foreground px-6 py-8 text-center">
                No reviews match your filters.
              </p>
            ) : (
              filtered.map((review) => (
                <div
                  key={review.id}
                  className="flex flex-row items-start gap-4 px-6 py-4 border-b last:border-0"
                >
                  {/* Avatar */}
                  <div className="size-9 rounded-full bg-muted flex items-center justify-center text-xs font-medium shrink-0">
                    {review.initials}
                  </div>

                  {/* Content */}
                  <div className="flex-1 space-y-2 min-w-0">
                    <div className="flex flex-row items-center justify-between gap-2">
                      <div className="flex flex-col gap-0.5 min-w-0">
                        <span className="text-sm font-medium truncate">
                          {review.fullName}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {review.username}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground whitespace-nowrap shrink-0">
                        {review.date}
                      </span>
                    </div>

                    <StarRow rating={review.rating} />

                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {review.content}
                    </p>

                    <div className="flex flex-row justify-end">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-7 text-xs text-muted-foreground gap-1.5 hover:text-destructive"
                        onClick={() => setReportReview(review.id)}
                      >
                        <Flag size={14} />
                        Report
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* Report Review Dialog */}
      <AlertDialog
        open={reportReview !== null}
        onOpenChange={() => setReportReview(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Report this review?</AlertDialogTitle>
            <AlertDialogDescription>
              This will send a notification to the Nook team for review. The
              review will remain visible until the team takes action. We do not
              remove reviews on behalf of owners.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => {
                setReportReview(null)
                console.log("Review reported — the Nook team will take a look.")
              }}
            >
              Send Report
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
