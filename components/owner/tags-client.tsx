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
import { updateTagsAction } from "@/app/owner/actions"

type Tag = {
  id: string
  name: string
  category: string
  sort_order: number
  is_active: boolean
}

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
            {tag.name}
          </Button>
        )
      })}
    </div>
  )
}

export function OwnerTagsClient({
  allTags,
  appliedTagIds,
  featuredTagId,
}: {
  allTags: Tag[]
  appliedTagIds: string[]
  featuredTagId: string | null
}) {
  const [isDirty, setIsDirty] = React.useState(false)
  const [isSaving, setIsSaving] = React.useState(false)
  const [selectedTags, setSelectedTags] = React.useState<string[]>(appliedTagIds)
  const [featuredTag, setFeaturedTag] = React.useState<string>(
    featuredTagId ?? appliedTagIds[0] ?? ""
  )

  const bestForTags = allTags.filter((t) => t.category === "best_for")
  const amenitiesTags = allTags.filter((t) => t.category === "amenities")
  const paymentTags = allTags.filter((t) => t.category === "payment")

  function toggleTag(tagId: string) {
    setSelectedTags((prev) =>
      prev.includes(tagId) ? prev.filter((t) => t !== tagId) : [...prev, tagId]
    )
    setIsDirty(true)
  }

  async function handleSave() {
    setIsSaving(true)
    try {
      await updateTagsAction(selectedTags, featuredTag || null)
      setIsDirty(false)
    } finally {
      setIsSaving(false)
    }
  }

  const selectedTagObjects = allTags.filter((t) => selectedTags.includes(t.id))
  const bestForCount = bestForTags.filter((t) => selectedTags.includes(t.id)).length
  const amenitiesCount = amenitiesTags.filter((t) => selectedTags.includes(t.id)).length
  const paymentCount = paymentTags.filter((t) => selectedTags.includes(t.id)).length

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
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
            className="w-full sm:w-auto"
            disabled={!isDirty || isSaving}
            onClick={handleSave}
          >
            <FloppyDisk className="size-4" />
            {isSaving ? "Saving..." : "Save Changes"}
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
                    {tag.name}
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
        {bestForTags.length > 0 && (
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
                tags={bestForTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

        {/* Amenities */}
        {amenitiesTags.length > 0 && (
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
                tags={amenitiesTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

        {/* Payment Accepted */}
        {paymentTags.length > 0 && (
          <Card>
            <CardHeader>
              <div className="flex flex-row items-center justify-between">
                <div className="flex flex-col gap-0.5">
                  <CardTitle>Payment Accepted</CardTitle>
                  <CardDescription>
                    What payment methods do you accept?
                  </CardDescription>
                </div>
                <Badge variant="secondary">{paymentCount} selected</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <TagToggleGroup
                tags={paymentTags}
                selectedTags={selectedTags}
                onToggle={toggleTag}
              />
            </CardContent>
          </Card>
        )}

        {/* Vibe Tags — Phase 2 Callout */}
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between rounded-lg border border-dashed px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Vibe tags</p>
            <p className="text-xs text-muted-foreground">
              Aesthetic / IG-worthy, Cozy &amp; Warm, Minimalist, and more —
              coming in Phase 2.
            </p>
          </div>
          <Badge variant="outline" className="self-start sm:self-auto">Phase 2</Badge>
        </div>

        {isDirty && <div className="h-20" />}
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between z-50">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex flex-row gap-2">
            <Button
              variant="outline"
              className="flex-1 sm:flex-none"
              onClick={() => {
                setSelectedTags(appliedTagIds)
                setFeaturedTag(featuredTagId ?? appliedTagIds[0] ?? "")
                setIsDirty(false)
              }}
            >
              Discard
            </Button>
            <Button
              variant="default"
              className="flex-1 sm:flex-none"
              onClick={handleSave}
              disabled={isSaving}
            >
              <FloppyDisk className="size-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
