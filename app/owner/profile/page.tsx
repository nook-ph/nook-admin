"use client"

import * as React from "react"
import {
  CheckCircle,
  EnvelopeSimple,
  FacebookLogo,
  FloppyDisk,
  Globe,
  Info,
  InstagramLogo,
  TiktokLogo,
} from "@phosphor-icons/react"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

type DayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday"

type DayHours = {
  open: string
  close: string
  closed: boolean
}

const DAYS: { key: DayKey; label: string }[] = [
  { key: "monday", label: "Monday" },
  { key: "tuesday", label: "Tuesday" },
  { key: "wednesday", label: "Wednesday" },
  { key: "thursday", label: "Thursday" },
  { key: "friday", label: "Friday" },
  { key: "saturday", label: "Saturday" },
  { key: "sunday", label: "Sunday" },
]

export default function OwnerProfilePage() {
  const [isDirty, setIsDirty] = React.useState(false)
  const [descCount, setDescCount] = React.useState(152)
  const [correctionText, setCorrectionText] = React.useState("")
  const [correctionSent, setCorrectionSent] = React.useState(false)

  const [hours, setHours] = React.useState<Record<DayKey, DayHours>>({
    monday:    { open: "08:00", close: "22:00", closed: false },
    tuesday:   { open: "08:00", close: "22:00", closed: false },
    wednesday: { open: "08:00", close: "22:00", closed: false },
    thursday:  { open: "08:00", close: "22:00", closed: false },
    friday:    { open: "08:00", close: "23:00", closed: false },
    saturday:  { open: "09:00", close: "23:00", closed: false },
    sunday:    { open: "09:00", close: "21:00", closed: false },
  })

  function updateHours(day: DayKey, field: keyof DayHours, value: string | boolean) {
    setHours((prev) => ({
      ...prev,
      [day]: { ...prev[day], [field]: value },
    }))
    setIsDirty(true)
  }

  function handleSave() {
    console.log("Saving changes...")
    setIsDirty(false)
  }

  return (
    <>
      <div className="w-full max-w-6xl mx-auto px-4 py-6 sm:px-6 sm:py-8 space-y-6">

        {/* Page Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-2">
          <div>
            <h1 className="text-2xl font-semibold">Edit Listing</h1>
            <p className="text-sm text-muted-foreground">Update your cafe details</p>
          </div>
          <Button
            variant="default"
            size="sm"
            className="w-full sm:w-auto"
            onClick={handleSave}
            disabled={!isDirty}
          >
            <FloppyDisk className="size-4" />
            Save Changes
          </Button>
        </div>

        {/* Card 1 — Cafe Name */}
        <Card>
          <CardHeader>
            <CardTitle>Cafe name</CardTitle>
            <CardDescription>
              Changes are flagged for Nook team review before going live
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="space-y-2">
              <Label htmlFor="cafe-name">Name</Label>
              <Input
                id="cafe-name"
                defaultValue="Slowpoke Coffee"
                onChange={() => setIsDirty(true)}
              />
            </div>
            <div className="flex items-start gap-2 rounded-md bg-amber-50 border border-amber-200 px-3 py-2 dark:bg-amber-950 dark:border-amber-800">
              <Info className="size-3.5 text-amber-600 dark:text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-amber-800 dark:text-amber-200">
                Name changes are reviewed by the Nook team before going live to
                prevent errors.
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Card 2 — Description */}
        <Card>
          <CardHeader>
            <CardTitle>Description</CardTitle>
            <CardDescription>
              cafes.description — max 300 characters
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <Textarea
                defaultValue="A refined retreat in the heart of IT Park. Contemporary elegance with warm hospitality, featuring plush seating and ambient lighting."
                rows={4}
                className="resize-none"
                maxLength={300}
                onChange={(e) => {
                  setDescCount(e.target.value.length)
                  setIsDirty(true)
                }}
              />
              <div className="flex flex-row justify-end">
                <span className="text-xs text-muted-foreground">
                  {descCount} / 300
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 3 — Operating Hours */}
        <Card>
          <CardHeader>
            <CardTitle>Operating hours</CardTitle>
            <CardDescription>
              cafes.operating_hours (jsonb) — changes go live immediately
            </CardDescription>
          </CardHeader>
          <CardContent>
            {DAYS.map(({ key, label }) => (
              <div
                key={key}
                className="flex flex-col gap-2 py-3 border-b last:border-0 sm:flex-row sm:items-center sm:gap-4"
              >
                <span className="text-sm font-medium sm:w-28 sm:shrink-0">{label}</span>

                <div className="flex flex-row items-center gap-2 flex-1">
                  <Input
                    type="time"
                    className="flex-1 sm:w-32 sm:flex-none"
                    value={hours[key].open}
                    disabled={hours[key].closed}
                    onChange={(e) => updateHours(key, "open", e.target.value)}
                  />
                  <span className="text-xs text-muted-foreground">to</span>
                  <Input
                    type="time"
                    className="flex-1 sm:w-32 sm:flex-none"
                    value={hours[key].close}
                    disabled={hours[key].closed}
                    onChange={(e) => updateHours(key, "close", e.target.value)}
                  />
                  <div className="flex items-center gap-2 sm:hidden ml-auto">
                    <Switch
                      checked={hours[key].closed}
                      onCheckedChange={(v) => {
                        updateHours(key, "closed", v)
                        setIsDirty(true)
                      }}
                    />
                    <Label className="text-xs text-muted-foreground">Closed</Label>
                  </div>
                </div>

                <div className="hidden sm:flex items-center gap-2 ml-auto">
                  <Switch
                    checked={hours[key].closed}
                    onCheckedChange={(v) => {
                      updateHours(key, "closed", v)
                      setIsDirty(true)
                    }}
                  />
                  <Label className="text-xs text-muted-foreground">Closed</Label>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Card 4 — Social Links */}
        <Card>
          <CardHeader>
            <CardTitle>Social links</CardTitle>
            <CardDescription>
              cafes.social_links (jsonb) — changes go live immediately
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Instagram</Label>
              <div className="relative">
                <InstagramLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://instagram.com/..."
                  defaultValue="https://instagram.com/slowpokecoffeecebu"
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Facebook</Label>
              <div className="relative">
                <FacebookLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://facebook.com/..."
                  defaultValue=""
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>TikTok</Label>
              <div className="relative">
                <TiktokLogo className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://tiktok.com/..."
                  defaultValue="https://tiktok.com/@slowpokecoffee"
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Website</Label>
              <div className="relative">
                <Globe className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                <Input
                  className="pl-9"
                  placeholder="https://..."
                  defaultValue=""
                  onChange={() => setIsDirty(true)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Card 5 — Address Correction Request */}
        <Card>
          <CardHeader>
            <CardTitle>Address</CardTitle>
            <CardDescription>
              cafes.address — corrections are sent to the Nook team for
              verification
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-lg bg-muted px-4 py-3">
              <p className="text-xs text-muted-foreground mb-1">
                Current address
              </p>
              <p className="text-sm font-medium">
                Ground Floor, Oakridge Business Park, 880 AS Fortuna St, IT
                Park, Cebu City
              </p>
              <div className="flex flex-row gap-4 mt-2">
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Latitude</p>
                  <p className="text-xs font-mono">10.3157</p>
                </div>
                <div className="flex flex-col">
                  <p className="text-xs text-muted-foreground">Longitude</p>
                  <p className="text-xs font-mono">123.8854</p>
                </div>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm font-medium mb-2">Request a correction</p>
              <p className="text-xs text-muted-foreground mb-3">
                Coordinates can only be updated by the Nook team to ensure map
                accuracy. Describe the correction and we&apos;ll update it
                within 24 hours.
              </p>
              <Textarea
                placeholder={`e.g. We moved to the 2nd floor, or the pin is slightly off — we're actually on Nivel Hills Road not AS Fortuna...`}
                rows={3}
                className="resize-none"
                value={correctionText}
                onChange={(e) => setCorrectionText(e.target.value)}
              />

              {correctionSent ? (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 mt-2">
                  <CheckCircle className="size-4" />
                  Correction request sent — we&apos;ll update this within 24
                  hours.
                </div>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-2"
                  disabled={!correctionText.trim()}
                  onClick={() => {
                    setCorrectionText("")
                    setCorrectionSent(true)
                  }}
                >
                  <EnvelopeSimple className="size-4" />
                  Send Correction Request
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bottom padding to clear sticky save bar when dirty */}
        {isDirty && <div className="h-20" />}
      </div>

      {/* Sticky Save Bar */}
      {isDirty && (
        <div className="fixed bottom-0 left-0 right-0 border-t bg-background/95 backdrop-blur px-4 py-3 sm:px-6 sm:py-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between z-50">
          <p className="text-sm text-muted-foreground">
            You have unsaved changes
          </p>
          <div className="flex flex-row gap-2">
            <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => setIsDirty(false)}>
              Discard
            </Button>
            <Button variant="default" className="flex-1 sm:flex-none" onClick={handleSave}>
              <FloppyDisk className="size-4" />
              Save Changes
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
