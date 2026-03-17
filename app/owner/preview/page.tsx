import Link from "next/link"
import {
  ArrowLeft,
  Car,
  Eye,
  Heart,
  Image,
  ImageSquare,
  InstagramLogo,
  Lightning,
  MapPin,
  MapTrifold,
  NavigationArrow,
  PencilSimple,
  Snowflake,
  Star,
  TiktokLogo,
  WifiHigh,
} from "@phosphor-icons/react/dist/ssr"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

const MENU_HIGHLIGHTS = [
  { name: "Iced Oat Latte",     price: "₱180.00" },
  { name: "Pour Over Ethiopia", price: "₱220.00" },
  { name: "Matcha Latte",       price: "₱160.00" },
]

const AMENITIES = [
  { Icon: WifiHigh,   label: "Free WiFi"       },
  { Icon: Snowflake,  label: "Air Conditioned" },
  { Icon: Lightning,  label: "Power Outlets"   },
  { Icon: Car,        label: "Parking"         },
]

export default function OwnerPreviewPage() {
  return (
    <div className="flex flex-col h-full">

      {/* Toolbar */}
      <div className="border-b bg-background px-6 py-3 flex items-center justify-between sticky top-0 z-10">
        <div className="flex flex-row items-center gap-3">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/owner/dashboard">
              <ArrowLeft size={16} />
              Back to dashboard
            </Link>
          </Button>
          <Separator orientation="vertical" className="h-5" />
          <p className="text-sm text-muted-foreground">
            Preview — Slowpoke Coffee
          </p>
        </div>
        <div className="flex flex-row items-center gap-2">
          <Badge variant="outline" className="gap-1.5">
            <Eye size={12} />
            Read only
          </Badge>
          <Button variant="outline" size="sm" asChild>
            <Link href="/owner/profile">
              <PencilSimple size={16} />
              Edit listing
            </Link>
          </Button>
        </div>
      </div>

      {/* Preview area */}
      <div className="flex justify-center py-8 px-4 bg-muted min-h-screen">

        {/* Mobile device frame */}
        <div className="w-[390px] bg-background rounded-[40px] border-[3px] border-foreground/20 shadow-2xl overflow-hidden">
          <div className="overflow-y-auto max-h-[844px]">

            {/* 1 — Hero image */}
            <div className="relative h-64 bg-muted">
              <div className="flex flex-col items-center justify-center h-full gap-2 text-muted-foreground">
                <Image size={40} />
                <p className="text-xs">featured_image_url</p>
              </div>
              <div className="absolute top-4 left-4">
                <div className="size-8 rounded-full bg-background/80 flex items-center justify-center">
                  <ArrowLeft size={16} />
                </div>
              </div>
              <div className="absolute top-4 right-4">
                <div className="size-8 rounded-full bg-background/80 flex items-center justify-center">
                  <Heart size={16} />
                </div>
              </div>
            </div>

            {/* 2 — Cafe info */}
            <div className="px-5 pt-4 pb-3 space-y-2">
              <div className="flex flex-row items-start justify-between gap-2">
                <h2 className="text-xl font-bold leading-tight">
                  Slowpoke Coffee
                </h2>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  New
                </Badge>
              </div>

              <div className="flex flex-row items-center gap-2 text-sm flex-wrap">
                <div className="flex flex-row items-center gap-0.5">
                  <Star size={14} weight="fill" className="text-yellow-400" />
                  <span className="font-semibold">4.9</span>
                </div>
                <span className="text-muted-foreground">(32 reviews)</span>
                <span className="text-muted-foreground">·</span>
                <span className="text-muted-foreground">1.2 km away</span>
              </div>

              <div className="flex flex-row items-center gap-1.5 text-sm text-muted-foreground">
                <MapPin size={14} />
                <span>IT Park, Cebu City</span>
              </div>

              <div className="flex flex-row items-center gap-1.5 text-sm">
                <div className="size-2 rounded-full bg-green-500" />
                <span className="text-green-600 font-medium">Open</span>
                <span className="text-muted-foreground">· Closes at 10 PM</span>
              </div>
            </div>

            {/* 3 — Tag pills */}
            <div className="px-5 pb-3">
              <div className="flex flex-row gap-2 overflow-x-auto pb-1">
                {["Student Friendly", "Free WiFi", "Solo Work"].map((tag) => (
                  <Badge
                    key={tag}
                    variant="secondary"
                    className="text-sm whitespace-nowrap"
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>

            {/* 4 — Divider */}
            <Separator className="mx-5" style={{ width: "calc(100% - 2.5rem)" }} />

            {/* 5 — Description */}
            <div className="px-5 py-3">
              <p className="text-sm text-muted-foreground leading-relaxed">
                A refined retreat in the heart of IT Park. Contemporary elegance
                with warm hospitality, featuring plush seating and ambient
                lighting.
              </p>
            </div>

            {/* 6 — Menu Highlights */}
            <div className="px-5 pb-4">
              <p className="text-sm font-semibold mb-3">Menu Highlights</p>
              <div className="flex flex-row gap-3 overflow-x-auto">
                {MENU_HIGHLIGHTS.map((item) => (
                  <div
                    key={item.name}
                    className="flex flex-col gap-1.5 shrink-0 w-28"
                  >
                    <div className="aspect-square rounded-lg bg-muted flex items-center justify-center">
                      <ImageSquare size={20} className="text-muted-foreground" />
                    </div>
                    <p className="text-xs font-medium leading-tight">
                      {item.name}
                    </p>
                    <p className="text-xs text-muted-foreground">{item.price}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* 7 — Divider */}
            <Separator className="mx-5" style={{ width: "calc(100% - 2.5rem)" }} />

            {/* 8 — Details */}
            <div className="px-5 py-4 space-y-4">

              {/* Amenities */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Amenities
                </p>
                <div className="flex flex-col gap-2">
                  {AMENITIES.map(({ Icon, label }) => (
                    <div key={label} className="flex items-center gap-2.5 text-sm">
                      <Icon size={16} className="text-muted-foreground shrink-0" />
                      <span>{label}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Best For */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Best For
                </p>
                <div className="flex flex-row flex-wrap gap-2">
                  {["Student Friendly", "Solo Work", "Date Spot"].map((tag) => (
                    <Badge key={tag} variant="outline" className="text-xs">
                      {tag}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Accepted Payments */}
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2">
                  Accepted Payments
                </p>
                <div className="flex flex-row gap-2">
                  {["Cash", "GCash", "Maya"].map((method) => (
                    <Badge key={method} variant="outline" className="text-xs">
                      {method}
                    </Badge>
                  ))}
                </div>
              </div>
            </div>

            {/* 9 — Location & Contacts */}
            <div className="px-5 pb-4 space-y-3">
              <p className="text-sm font-semibold">Location &amp; Contacts</p>

              <div className="h-28 w-full bg-muted rounded-xl flex items-center justify-center">
                <MapTrifold size={24} className="text-muted-foreground" />
              </div>

              <p className="text-xs text-muted-foreground">
                Ground Floor, Oakridge Business Park, 880 AS Fortuna St, IT
                Park, Cebu City
              </p>

              <button className="w-full h-9 text-sm gap-2 rounded-md border flex items-center justify-center">
                <NavigationArrow size={16} />
                Get Directions
              </button>

              <div className="flex flex-row gap-3">
                <InstagramLogo size={20} className="text-muted-foreground" />
                <TiktokLogo size={20} className="text-muted-foreground" />
              </div>
            </div>

            {/* 10 — Reviews */}
            <div className="px-5 pb-6">
              <div className="flex flex-row items-center justify-between mb-4">
                <p className="text-sm font-semibold">Reviews</p>
                <button className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                  See All
                </button>
              </div>

              <div>
                <div className="py-3 border-b">
                  <div className="flex flex-row items-center justify-between mb-1">
                    <span className="text-xs font-medium">Jana Cruz</span>
                    <div className="flex flex-row gap-0.5">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          weight="fill"
                          className="text-yellow-400"
                        />
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Best pour over in Cebu. Absolutely love this place.
                  </p>
                </div>

                <div className="py-3">
                  <div className="flex flex-row items-center justify-between mb-1">
                    <span className="text-xs font-medium">Marco Reyes</span>
                    <div className="flex flex-row gap-0.5">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <Star
                          key={i}
                          size={12}
                          weight="fill"
                          className="text-yellow-400"
                        />
                      ))}
                      <Star size={12} className="text-muted-foreground" />
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground line-clamp-2">
                    Great atmosphere. WiFi is fast and baristas are great.
                  </p>
                </div>
              </div>
            </div>

            {/* 11 — Bottom safe area */}
            <div className="h-8" />

          </div>
        </div>
      </div>
    </div>
  )
}
