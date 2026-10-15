"use client"

import * as React from "react"

/** The current time, re-read each minute so a schedule boundary shows without
 *  a reload. Null until mounted, so server and client markup match. */
export function useNow() {
  const [now, setNow] = React.useState<Date | null>(null)
  React.useEffect(() => {
    const first = setTimeout(() => setNow(new Date()), 0)
    const t = setInterval(() => setNow(new Date()), 60_000)
    return () => {
      clearTimeout(first)
      clearInterval(t)
    }
  }, [])
  return now
}
