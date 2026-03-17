"use client"

import * as React from "react"
import { Check, FloppyDisk, Star } from "@phosphor-icons/react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

type Tag = { id: string; label: string }

const BEST_FOR: Tag[] = [
  { id: "date-spot",        label: "Date Spot" },
  { id: "solo-work",        label: "Solo Work / Study" },
  { id: "group-hangout",    label: "Group Hangout" },
  { id: "book-cafe",        label: "Book Cafe" },
  { id: "co-working",       label: "Co-working Space" },
  { id: "late-night",       label: "Late Night" },
  { id: "quick-coffee",     label: "Quick Coffee" },
  { id: "family-friendly",  label: "Family Friendly" },
  { id: "nature-cafe",      label: "Nature Cafe" },
  { id: "special-occasion", label: "Special Occasion" },
  { id: "student-friendly", label: "Student Friendly" },
]

const AMENITIES: Tag[] = [
  { id: "free-wifi",      label: "Free WiFi" },
  { id: "high-speed-wifi",label: "High-Speed WiFi" },
  { id: "power-outlets",  label: "Power Outlets" },
  { id: "air-conditioned",label: "Air Conditioned" },
  { id: "outdoor-seating",label: "Outdoor Seating" },
  { id: "pet-friendly",   label: "Pet Friendly" },
  { id: "parking",        label: "Parking Available" },
  { id: "wheelchair",     label: "Wheelchair Accessible" },
]

const PAYMENT: Tag[] = [
  { id: "cash",  label: "Cash" },
  { id: "gcash", label: "GCash" },
  { id: "maya",  label: "Maya" },
  { id: "card",  label: "Credit / Debit Card" },
]

const ALL_TAGS: Tag[] = [...BEST_FOR, ...AMENITIES, ...PAYMENT]

const DEFAULT_SELECTED = [
  "student-friendly",
  "solo-work",
  "free-wifi",
  "power-outlets",
  "air-conditioned",
  "cash",
  "gcash",
  "maya",
]

function TagToggleGroup({
  tags,
  selectedTags,
  onToggle,
}: {
  tags: Tag[]
  selectedTags: string[]
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-row flex-wrap gap-2">
      {tags.map((tag) => {
        const selected = selectedTags.includes(tag.id)
        return (
          <Button
            key={tag.id}
            variant={selected ? "default" : "outline"}
            size="sm"
            onClick={() => onToggle(tag.id)}
            className={selected ? "gap-1.5" : "gap-1.5 text-muted-foreground"}
          >
            {selected && <Check size={12} />}
            {tag.label}
          </Button>
        )
      })}
    </div>
  )
}

export default function OwnerTagsPage() {
  const [isDirty, setIsDirty] = React.useState(false)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(DEFAULT_SELECTED)
  const [featuredTag, setFeaturedTag] = React.useState("student-friendly")

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
    setIsDirty(true)
  }

  function handleSave() {
    console.log("Saving tags...")
    setIsDirty(false)
  }

  const selectedTagObjects = ALL_TAGS.filter((t) => selectedTags.includes(t.id))

  const bestForCount  = BEST_FOR.filter((t)  => selectedTags.includes(t.id)).length
  const amenitiesCount = AMENITIES.filter((t) => selectedTags.includes(t.id)).length
  const paymentCount  = PAYMENT.filter((t)   => selectedTags.includes(t.id)).length

  return (
    <>
      <div className="w-full mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-row items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <h1 className="text-2xl font-semibold">Tags</h1>
            <p className="text-sm text-muted-foreground">
              Select all tags that apply to your cafe. Tags help users discover
              you in search and filters.
            </p>
          </div>
          <Button
            variant="default"
            size="sm"
            disabled={!isDirty}
            onClick={handleSave}
          >
            <FloppyDisk className="size-4" />
            Save Changes
          </Button>
        </div>

        {/* Featured Tag Card */}
        <Card>
          <CardHeader>
            <CardTitle>Featured tag</CardTitle>
            <CardDescription>
              cafe_tags.is_featured — one tag shown on cafe cards in search
              results and the home feed
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Select
              value={featuredTag}
              onValueChange={(v) => {
                setFeaturedTag(v)
                setIsDirty(true)
              }}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a featured tag" />
              </SelectTrigger>
              <SelectContent>
                {selectedTagObjects.map((tag) => (
                  <SelectItem key={tag.id} value={tag.id}>
                    {tag.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <div className="flex items-center gap-2 rounded-md bg-muted px-3 py-2">
              <Star size={14} className="text-yellow-500 shrink-0" />
              <p className="text-xs text-muted-foreground">
                This tag appears as the primary label on your cafe card. Choose
                the one that best describes your cafe at a glance.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Best For */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Best For</CardTitle>
                <CardDescription>
                  Why would someone visit your cafe?
                </CardDescription>
              </div>
              <Badge variant="secondary">{bestForCount} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TagToggleGroup
              tags={BEST_FOR}
              selectedTags={selectedTags}
              onToggle={toggleTag}
            />
          </CardContent>
        </Card>

        {/* Amenities */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Amenities</CardTitle>
                <CardDescription>What does your cafe have?</CardDescription>
              </div>
              <Badge variant="secondary">{amenitiesCount} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TagToggleGroup
              tags={AMENITIES}
              selectedTags={selectedTags}
              onToggle={toggleTag}
            />
          </CardContent>
        </Card>

        {/* Payment Accepted */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Payment Accepted</CardTitle>
                <CardDescription>
                  cafes.social_links — what payment methods do you accept?
                </CardDescription>
              </div>
              <Badge variant="secondary">{paymentCount} selected</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <TagToggleGroup
              tags={PAYMENT}
              selectedTags={selectedTags}
              onToggle={toggleTag}
            />
          </CardContent>
        </Card>

        {/* Vibe Tags — Phase 2 Callout */}
        <div className="flex items-center justify-between rounded-lg border border-dashed px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Vibe tags</p>
            <p className="text-xs text-muted-foreground">
              Aesthetic / IG-worthy, Cozy &amp; Warm, Minimalist, and more —
              coming in Phase 2.
            </p>
          </div>
          <Badge variant="outline">Phase 2</Badge>
        </div>

        {isDirty && <div className="h-20" />}
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-6 py-4 flex items-center justify-between z-50">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex flex-row gap-2">
            <Button variant="outline" onClick={() => setIsDirty(false)}>
              Discard
            </Button>
            <Button variant="default" onClick={handleSave}>
              <FloppyDisk className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
