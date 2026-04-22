import React from "react"
import Image from "next/image"

export default function OnboardingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex min-h-svh flex-col items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-2xl flex flex-col items-center gap-6">
        <Image src="/logoT.png" alt="Nook" width={80} height={20} className="h-5 w-auto" />
        {children}
      </div>
    </div>
  )
}
