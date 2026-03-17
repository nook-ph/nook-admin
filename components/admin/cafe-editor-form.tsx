"use client"

import * as React from "react"
import Link from "next/link"
import {
  ArrowLeft,
  MapPin,
  Plus,
  X,
  Trash,
  DotsSixVertical,
  InstagramLogo,
  FacebookLogo,
  TiktokLogo,
  Globe,
  Eye,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Separator } from "@/components/ui/separator"
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
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface CafeEditorFormProps {
  mode: "new" | "edit"
  id?: string
}

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
] as const

const TAG_GROUPS = [
  {
    label: "Best For",
    tags: [
      "Date Spot",
      "Solo Work",
      "Group Hangout",
      "Book Cafe",
      "Co-working Space",
      "Late Night",
      "Quick Coffee",
      "Family Friendly",
      "Nature Cafe",
      "Special Occasion",
    ],
    vibe: false,
  },
  {
    label: "Amenities",
    tags: [
      "Free WiFi",
      "High-Speed WiFi",
      "Power Outlets",
      "Air Conditioned",
      "Outdoor Seating",
      "Pet Friendly",
      "Parking Available",
      "Wheelchair Accessible",
    ],
    vibe: false,
  },
  {
    label: "Payment",
    tags: ["Cash", "GCash", "Maya", "Credit & Debit Card"],
    vibe: false,
  },
  {
    label: "Vibe",
    tags: [
      "Aesthetic",
      "Cozy & Warm",
      "Minimalist",
      "Industrial",
      "Garden",
      "Dark Academia",
    ],
    vibe: true,
  },
] as const

const ALL_TAGS = TAG_GROUPS.flatMap((g) => g.tags)

interface MenuItem {
  id: number
  name: string
  price: string
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <label className="text-xs font-medium leading-none">{children}</label>
  )
}

function FieldGroup({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <FieldLabel>{label}</FieldLabel>
      {children}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Main component
// ---------------------------------------------------------------------------

export function CafeEditorForm({ mode, id }: CafeEditorFormProps) {
  // --- Basic Info ---
  const [description, setDescription] = React.useState("")

  // --- Operating Hours ---
  const [closedDays, setClosedDays] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(DAYS.map((d) => [d, false]))
  )

  // --- Tags ---
  const [selectedTags, setSelectedTags] = React.useState<Set<string>>(
    new Set()
  )
  const [featuredTag, setFeaturedTag] = React.useState("")

  function toggleTag(tag: string) {
    setSelectedTags((prev) => {
      const next = new Set(prev)
      next.has(tag) ? next.delete(tag) : next.add(tag)
      return next
    })
  }

  // --- Menu highlights ---
  const [menuItems, setMenuItems] = React.useState<MenuItem[]>([
    { id: 1, name: "", price: "" },
    { id: 2, name: "", price: "" },
  ])
  const nextId = React.useRef(3)

  function addMenuItem() {
    if (menuItems.length >= 5) return
    setMenuItems((prev) => [
      ...prev,
      { id: nextId.current++, name: "", price: "" },
    ])
  }

  function removeMenuItem(id: number) {
    setMenuItems((prev) => prev.filter((item) => item.id !== id))
  }

  function updateMenuItem(id: number, field: "name" | "price", value: string) {
    setMenuItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, [field]: value } : item))
    )
  }

  // --- Sidebar ---
  const [listingStatus, setListingStatus] = React.useState(
    mode === "new" ? "draft" : "active"
  )
  const [flagNew, setFlagNew] = React.useState(false)
  const [flagFeatured, setFlagFeatured] = React.useState(false)
  const [flagActive, setFlagActive] = React.useState(true)

  // ---------------------------------------------------------------------------
  // Render
  // ---------------------------------------------------------------------------

  return (
    <TooltipProvider>
      <div className="max-w-6xl mx-auto px-6 py-6">
        {/* Page header */}
        <div className="flex items-center gap-4 mb-8">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/admin/cafes">
              <ArrowLeft />
            </Link>
          </Button>
          <div className="flex flex-col">
            <h1 className="text-xl font-semibold">
              {mode === "new" ? "Add Cafe" : "Edit Cafe"}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === "new"
                ? "Fill in the details below"
                : "Update the cafe details"}
            </p>
          </div>
        </div>

        {/* Two-column layout */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* ----------------------------------------------------------------
              Left column — form
          ---------------------------------------------------------------- */}
          <div className="flex-1 min-w-0 flex flex-col gap-4">

            {/* CARD 1 — Basic Info */}
            <Card>
              <CardHeader>
                <CardTitle>Basic Info</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Cafe name">
                  <Input placeholder="e.g. Slowpoke Coffee" />
                </FieldGroup>
                <FieldGroup label="Neighborhood">
                  <Input placeholder="e.g. IT Park" />
                </FieldGroup>
                <FieldGroup label="City">
                  <Input defaultValue="Cebu City" />
                </FieldGroup>
                <FieldGroup label="Description">
                  <Textarea
                    placeholder="A short description of the cafe..."
                    maxLength={300}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="resize-none"
                    rows={4}
                  />
                  <div className="flex justify-end">
                    <span className="text-xs text-muted-foreground">
                      {description.length} / 300
                    </span>
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* CARD 2 — Location */}
            <Card>
              <CardHeader>
                <CardTitle>Location</CardTitle>
                <CardDescription>
                  Drop a pin to set the exact location
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Address">
                  <Input placeholder="e.g. Ground Floor, IT Park" />
                </FieldGroup>

                <div className="mt-3 h-64 w-full rounded-lg border border-dashed border-border bg-muted flex flex-col items-center justify-center gap-2 text-muted-foreground">
                  <MapPin className="size-8" />
                  <p className="text-sm">Map picker</p>
                  <p className="text-xs">Mapbox GL JS loads here</p>
                </div>

                <div className="flex flex-col gap-1.5">
                  <div className="grid grid-cols-2 gap-3">
                    <FieldGroup label="Latitude">
                      <Input value="10.3157" disabled />
                    </FieldGroup>
                    <FieldGroup label="Longitude">
                      <Input value="123.8854" disabled />
                    </FieldGroup>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Coordinates update automatically when you move the pin
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* CARD 3 — Operating Hours */}
            <Card>
              <CardHeader>
                <CardTitle>Operating Hours</CardTitle>
              </CardHeader>
              <CardContent>
                {DAYS.map((day) => {
                  const isClosed = closedDays[day]
                  return (
                    <div
                      key={day}
                      className="flex items-center gap-4 py-2 border-b last:border-0"
                    >
                      <span className="w-24 text-sm font-medium shrink-0">
                        {day}
                      </span>
                      <Input
                        className="w-32"
                        placeholder="08:00"
                        disabled={isClosed}
                      />
                      <Input
                        className="w-32"
                        placeholder="22:00"
                        disabled={isClosed}
                      />
                      <div className="flex items-center gap-2 ml-auto">
                        <label
                          htmlFor={`closed-${day}`}
                          className="text-xs text-muted-foreground cursor-pointer select-none"
                        >
                          Closed
                        </label>
                        <Switch
                          id={`closed-${day}`}
                          checked={isClosed}
                          onCheckedChange={(val) =>
                            setClosedDays((prev) => ({
                              ...prev,
                              [day]: val,
                            }))
                          }
                        />
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

            {/* CARD 4 — Photos */}
            <Card>
              <CardHeader>
                <CardTitle>Photos</CardTitle>
                <CardDescription>
                  Upload up to 10 photos. First photo is the hero.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
                  {/* Upload button */}
                  <div className="aspect-square rounded-lg border-2 border-dashed border-border flex flex-col items-center justify-center gap-1 cursor-pointer hover:bg-muted transition-colors text-muted-foreground">
                    <Plus className="size-6" />
                    <span className="text-xs">Add photo</span>
                  </div>

                  {/* Placeholder 1 — Hero */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                    >
                      <X className="size-3" />
                    </Button>
                    <Badge className="absolute bottom-1 left-1 text-xs">
                      Hero
                    </Badge>
                  </div>

                  {/* Placeholder 2 */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>

                  {/* Placeholder 3 */}
                  <div className="relative aspect-square rounded-lg bg-muted overflow-hidden">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="absolute top-1 right-1 size-6 bg-background/80 hover:bg-background"
                    >
                      <X className="size-3" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* CARD 5 — Tags */}
            <Card>
              <CardHeader>
                <CardTitle>Tags</CardTitle>
                <CardDescription>
                  Select all tags that apply to this cafe
                </CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-1">
                {TAG_GROUPS.map((group) => (
                  <div key={group.label}>
                    <div className="flex items-center gap-2">
                      <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide mb-2 mt-4 first:mt-0">
                        {group.label}
                      </p>
                      {group.vibe && (
                        <p className="text-xs text-muted-foreground mb-2 mt-4">
                          (hidden in app)
                        </p>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {group.tags.map((tag) => {
                        const selected = selectedTags.has(tag)
                        return (
                          <Button
                            key={tag}
                            variant="outline"
                            size="sm"
                            onClick={() => toggleTag(tag)}
                            className={
                              selected
                                ? "bg-primary text-primary-foreground border-primary"
                                : ""
                            }
                          >
                            {tag}
                          </Button>
                        )
                      })}
                    </div>
                  </div>
                ))}

                <div className="flex flex-col gap-1.5 mt-6">
                  <FieldLabel>Featured tag (shown on cafe cards)</FieldLabel>
                  <Select value={featuredTag} onValueChange={setFeaturedTag}>
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select one tag..." />
                    </SelectTrigger>
                    <SelectContent>
                      {ALL_TAGS.map((tag) => (
                        <SelectItem key={tag} value={tag}>
                          {tag}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* CARD 6 — Menu Highlights */}
            <Card>
              <CardHeader>
                <CardTitle>Menu Highlights</CardTitle>
                <CardDescription>Up to 5 featured items</CardDescription>
              </CardHeader>
              <CardContent>
                {menuItems.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center gap-3 py-3 border-b last:border-0"
                  >
                    <DotsSixVertical className="text-muted-foreground size-4 cursor-grab shrink-0" />
                    <div className="size-10 rounded-md bg-muted shrink-0" />
                    <div className="flex flex-col flex-1">
                      <Input
                        placeholder="Item name"
                        className="text-sm"
                        value={item.name}
                        onChange={(e) =>
                          updateMenuItem(item.id, "name", e.target.value)
                        }
                      />
                      <Input
                        placeholder="₱0.00"
                        className="mt-1 w-32 text-sm"
                        value={item.price}
                        onChange={(e) =>
                          updateMenuItem(item.id, "price", e.target.value)
                        }
                      />
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => removeMenuItem(item.id)}
                    >
                      <Trash />
                    </Button>
                  </div>
                ))}

                <div className="mt-3">
                  {menuItems.length >= 5 ? (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="inline-block">
                          <Button
                            variant="outline"
                            size="sm"
                            disabled
                            className="pointer-events-none"
                          >
                            <Plus />
                            Add Item
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>Max 5 items</TooltipContent>
                    </Tooltip>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={addMenuItem}
                    >
                      <Plus />
                      Add Item
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* CARD 7 — Social Links */}
            <Card>
              <CardHeader>
                <CardTitle>Social Links</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-4">
                <FieldGroup label="Instagram">
                  <div className="relative">
                    <InstagramLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://instagram.com/..."
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="Facebook">
                  <div className="relative">
                    <FacebookLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://facebook.com/..."
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="TikTok">
                  <div className="relative">
                    <TiktokLogo className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input
                      className="pl-8"
                      placeholder="https://tiktok.com/..."
                    />
                  </div>
                </FieldGroup>
                <FieldGroup label="Website">
                  <div className="relative">
                    <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                    <Input className="pl-8" placeholder="https://..." />
                  </div>
                </FieldGroup>
              </CardContent>
            </Card>

            {/* CARD 8 — Metadata (edit only) */}
            {mode === "edit" && (
              <Card>
                <CardHeader>
                  <CardTitle>Metadata</CardTitle>
                </CardHeader>
                <CardContent>
                  <dl className="flex flex-col gap-3">
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Created
                      </dt>
                      <dd className="text-sm">Jan 12, 2025</dd>
                    </div>
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Last updated
                      </dt>
                      <dd className="text-sm">Mar 14, 2025</dd>
                    </div>
                    <div className="flex items-center gap-6">
                      <dt className="text-sm text-muted-foreground w-32 shrink-0">
                        Owner
                      </dt>
                      <dd className="text-sm">
                        owner@slowpokecoffee.com
                      </dd>
                    </div>
                  </dl>
                </CardContent>
              </Card>
            )}
          </div>

          {/* ----------------------------------------------------------------
              Right column — sticky sidebar
          ---------------------------------------------------------------- */}
          <div className="w-full lg:w-72 shrink-0">
            <div className="space-y-4 sticky top-6">

              {/* SIDEBAR CARD 1 — Status */}
              <Card>
                <CardHeader>
                  <CardTitle>Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <Select
                    value={listingStatus}
                    onValueChange={setListingStatus}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="draft">Draft</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </CardContent>
              </Card>

              {/* SIDEBAR CARD 2 — Flags */}
              <Card>
                <CardHeader>
                  <CardTitle>Flags</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">New listing</span>
                      <span className="text-xs text-muted-foreground">
                        Shows a &apos;New&apos; badge
                      </span>
                    </div>
                    <Switch
                      checked={flagNew}
                      onCheckedChange={setFlagNew}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Featured</span>
                      <span className="text-xs text-muted-foreground">
                        Shown as home hero card
                      </span>
                    </div>
                    <Switch
                      checked={flagFeatured}
                      onCheckedChange={setFlagFeatured}
                    />
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-sm font-medium">Active</span>
                      <span className="text-xs text-muted-foreground">
                        Visible in the app
                      </span>
                    </div>
                    <Switch
                      checked={flagActive}
                      onCheckedChange={setFlagActive}
                    />
                  </div>
                </CardContent>
              </Card>

              {/* SIDEBAR CARD 3 — Actions */}
              <Card>
                <CardContent className="pt-6 space-y-2">
                  <Button className="w-full">
                    {mode === "new" ? "Create Listing" : "Save & Publish"}
                  </Button>
                  <Button variant="outline" className="w-full">
                    Save as Draft
                  </Button>
                  <Separator className="my-1" />
                  {mode === "edit" && id ? (
                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/admin/cafes/${id}/preview`}>
                        <Eye />
                        Preview Listing
                      </Link>
                    </Button>
                  ) : (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <span className="block w-full">
                          <Button
                            variant="outline"
                            className="w-full pointer-events-none"
                            disabled
                          >
                            <Eye />
                            Preview Listing
                          </Button>
                        </span>
                      </TooltipTrigger>
                      <TooltipContent>
                        Save the listing first to preview it
                      </TooltipContent>
                    </Tooltip>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </TooltipProvider>
  )
}
