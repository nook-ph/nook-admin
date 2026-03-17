import { QuickActions } from "@/components/admin/quick-actions"
import { RecentActivity } from "@/components/admin/recent-activity"
import { SectionCards } from "@/components/admin/section-cards"

export default function DashboardPage() {
  return (
    <div className="w-full max-w-6xl mx-auto flex flex-col gap-6 px-4 py-6 lg:px-6">
      <SectionCards />
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <RecentActivity />
        <QuickActions />
      </div>
    </div>
  )
}
