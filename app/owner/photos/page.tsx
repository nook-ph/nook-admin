"use client"

import * as React from "react"
import {
  Crown,
  Image,
  Info,
  Lightbulb,
  Plus,
  Trash,
  UploadSimple,
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
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"

const TOTAL_SLOTS = 3
const USED_SLOTS = 2
const USED_PCT = Math.round((USED_SLOTS / TOTAL_SLOTS) * 100)

const TIPS = [
  "Show the interior — customers want to know what the vibe feels like before visiting",
  "Good lighting makes a huge difference — natural light or warm interior lighting works best",
  "Landscape photos look better on cafe cards and the map preview",
  "Update your hero photo seasonally to keep your listing feeling fresh",
]

export default function OwnerPhotosPage() {
  const [deleteConfirm, setDeleteConfirm] = React.useState<number | null>(null)

  return (
    <>
      <div className="w-full mx-auto px-6 py-8 space-y-6">

        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-semibold">Photos</h1>
          <p className="text-sm text-muted-foreground">
            Manage your cafe&apos;s photos. The hero photo appears everywhere in
            the app.
          </p>
        </div>

        {/* Schema Note Banner */}
        <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 dark:border-blue-800 dark:bg-blue-950">
          <Info
            size={16}
            className="text-blue-600 dark:text-blue-400 mt-0.5 shrink-0"
          />
          <div className="space-y-0.5">
            <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
              Photo storage
            </p>
            <p className="text-xs text-blue-700 dark:text-blue-300">
              Hero photo → cafes.featured_image_url · Additional photos →
              cafes.photo_urls (jsonb array) · Stored in Supabase Storage
              cafe-photos bucket
            </p>
          </div>
        </div>

        {/* Hero Photo Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Hero photo</CardTitle>
                <CardDescription>
                  cafes.featured_image_url — shown on cafe cards, map pins, and
                  the detail page header
                </CardDescription>
              </div>
              <Badge variant="secondary">Required</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-row gap-4 items-start">

              {/* Hero preview */}
              <div className="relative w-48 shrink-0">
                <div className="aspect-video w-full bg-muted rounded-lg flex flex-col items-center justify-center gap-2 text-muted-foreground border-2 border-dashed border-primary/30">
                  <Image size={32} />
                  <p className="text-xs">Hero photo</p>
                </div>
                <Badge className="absolute top-2 left-2 bg-primary text-primary-foreground text-xs">
                  Hero
                </Badge>
              </div>

              {/* Right content */}
              <div className="flex-1 space-y-3">
                <p className="text-sm text-muted-foreground">
                  This photo appears as the main image for your cafe throughout
                  the app. Use a high-quality, well-lit photo of your cafe
                  interior or exterior.
                </p>

                <div className="space-y-1.5">
                  <p className="text-xs text-muted-foreground">Requirements:</p>
                  <ul className="text-xs text-muted-foreground space-y-0.5 list-disc list-inside">
                    <li>JPG, PNG, or WEBP format</li>
                    <li>Maximum 5MB file size</li>
                    <li>Landscape orientation recommended</li>
                    <li>Minimum 800px wide</li>
                  </ul>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  className="gap-2"
                  onClick={() => console.log("Upload coming soon")}
                >
                  <UploadSimple size={16} />
                  Replace hero photo
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gallery Card */}
        <Card>
          <CardHeader>
            <div className="flex flex-row items-center justify-between">
              <div className="flex flex-col gap-0.5">
                <CardTitle>Gallery photos</CardTitle>
                <CardDescription>
                  cafes.photo_urls (jsonb) — up to 3 photos including the hero
                </CardDescription>
              </div>
              <Badge variant="outline">2 / 3 used</Badge>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">

            {/* Progress bar */}
            <div className="space-y-1.5">
              <div className="flex flex-row justify-between">
                <span className="text-xs text-muted-foreground">
                  Photo slots used
                </span>
                <span className="text-xs font-medium">2 of 3</span>
              </div>
              <Progress value={USED_PCT} className="h-1.5" />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">

              {/* Photo 1 — hero */}
              <div className="relative group">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border overflow-hidden">
                  <Image size={24} className="text-muted-foreground" />
                </div>
                <Badge className="absolute top-2 left-2 text-xs bg-primary text-primary-foreground z-10">
                  Hero
                </Badge>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {}}
                  >
                    <Crown size={12} />
                    Set hero
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(1)}
                  >
                    <Trash size={12} />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Photo 2 */}
              <div className="relative group">
                <div className="aspect-square bg-muted rounded-lg flex items-center justify-center border overflow-hidden">
                  <Image size={24} className="text-muted-foreground" />
                </div>
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center gap-2">
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7"
                    onClick={() => {}}
                  >
                    <Crown size={12} />
                    Set hero
                  </Button>
                  <Button
                    variant="secondary"
                    size="sm"
                    className="text-xs h-7 text-destructive hover:text-destructive"
                    onClick={() => setDeleteConfirm(2)}
                  >
                    <Trash size={12} />
                    Delete
                  </Button>
                </div>
              </div>

              {/* Add photo button */}
              <Button
                variant="outline"
                className="aspect-square h-full w-full border-dashed flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors rounded-lg"
                onClick={() => console.log("Upload coming soon")}
              >
                <Plus size={20} />
                <span className="text-xs">Add photo</span>
              </Button>
            </div>

            <p className="text-xs text-muted-foreground">
              Tip: Drag photos to reorder them. The first photo becomes the hero
              if you delete the current hero.
            </p>
          </CardContent>
        </Card>

        {/* Photo Tips Card */}
        <Card className="border-dashed bg-muted/30">
          <CardHeader>
            <div className="flex flex-row items-center gap-2">
              <Lightbulb size={16} className="text-muted-foreground" />
              <CardTitle className="text-sm">Photo tips</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {TIPS.map((tip, i) => (
                <div key={i} className="flex items-start gap-2">
                  <div className="size-1.5 rounded-full bg-muted-foreground/40 mt-2 shrink-0" />
                  <p className="text-xs text-muted-foreground">{tip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Phase 3 Upgrade Callout */}
        <div className="flex items-center justify-between rounded-lg border px-4 py-3">
          <div className="flex flex-col gap-0.5">
            <p className="text-sm font-medium">Want more photos?</p>
            <p className="text-xs text-muted-foreground">
              Unlimited photos available in Phase 3 with a Premium listing.
            </p>
          </div>
          <Badge variant="outline">Phase 3</Badge>
        </div>
      </div>

      {/* Delete Confirm Dialog */}
      <AlertDialog
        open={deleteConfirm !== null}
        onOpenChange={() => setDeleteConfirm(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete photo?</AlertDialogTitle>
            <AlertDialogDescription>
              This photo will be permanently removed from your listing and
              Supabase Storage.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              variant="destructive"
              onClick={() => setDeleteConfirm(null)}
            >
              Delete photo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
