import type { Metadata } from "next"
import Link from "next/link"
import { EnvelopeSimple } from "@phosphor-icons/react/dist/ssr"
import { getCafeById } from "@/lib/queries/cafes"

export async function generateMetadata(
  { params }: { params: Promise<{ id: string }> }
): Promise<Metadata> {
  const { id } = await params
  const cafe = await getCafeById(id)
  return { title: cafe?.name ?? "Cafe" }
}
import { getAllTags } from "@/lib/queries/tags"
import { getCategoriesForCafe } from "@/lib/queries/menu"
import { getInviteForCafe } from "@/lib/queries/invites"
import { CafeViewHeader } from "@/components/admin/cafe-view-header"
import { CafeEditorForm } from "@/components/admin/cafe-editor-form"
import { InviteStatusBadge } from "@/components/admin/invite-status-badge"
import { InviteTimeline } from "@/components/admin/invite-timeline"
import { InviteActions } from "@/components/admin/invite-actions"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

interface ViewCafePageProps {
  params: Promise<{ id: string }>
}

export default async function ViewCafePage({ params }: ViewCafePageProps) {
  const { id } = await params
  const [cafe, tags, categories, invite] = await Promise.all([
    getCafeById(id),
    getAllTags(true),
    getCategoriesForCafe(id),
    getInviteForCafe(id),
  ])

  return (
    <div className="max-w-6xl mx-auto px-6 py-6">
      <CafeViewHeader cafeId={id} cafeName={cafe.name} />
      <CafeEditorForm
        mode="edit"
        cafe={cafe}
        tags={tags}
        categories={categories}
        disabled={true}
      />

      {/* Owner Access section */}
      <div className="mt-8">
        <Separator className="mb-8" />
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between gap-4">
              <div>
                <CardTitle>Owner Access</CardTitle>
                <CardDescription>
                  Manage the invite sent to this cafe&apos;s owner
                </CardDescription>
              </div>
              {invite && (
                <InviteStatusBadge status={invite.status} />
              )}
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {!invite ? (
              <div className="flex flex-col items-start gap-3">
                <p className="text-sm text-muted-foreground">
                  No invite has been sent for this cafe yet.
                </p>
                <Button size="sm" asChild>
                  <Link href={`/admin/cafes/${id}/owner/new`}>
                    <EnvelopeSimple className="size-3.5" />
                    Send invite
                  </Link>
                </Button>
              </div>
            ) : (
              <>
                <div className="flex flex-col gap-1.5 text-sm">
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">Email</span>
                    <span className="font-medium">{invite.invited_email}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground w-16 shrink-0">Role</span>
                    <span className="capitalize">{invite.role}</span>
                  </div>
                </div>

                <Separator />

                <InviteTimeline
                  sent_at={invite.sent_at}
                  opened_at={invite.opened_at}
                  used_at={invite.used_at}
                  resent_at={invite.resent_at}
                  revoked_at={invite.revoked_at}
                />

                <Separator />

                <InviteActions
                  invite={{
                    id: invite.id,
                    status: invite.status,
                    invited_email: invite.invited_email,
                  }}
                  cafeId={id}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
