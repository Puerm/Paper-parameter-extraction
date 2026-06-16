"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDownIcon } from "lucide-react"

function SelectNative({
  className,
  size = "default",
  children,
  ...props
}: React.ComponentProps<"select"> & { size?: "sm" | "default" }) {
  return (
    <div className="relative">
      <select
        className={cn(
          "flex h-9 w-full appearance-none rounded-lg border border-slate-200 bg-white px-3 pr-8 text-sm text-slate-900 transition-colors",
          "hover:border-slate-300",
          "focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20",
          "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
          size === "sm" ? "h-8 text-xs" : "h-9",
          className
        )}
        {...props}
      >
        {children}
      </select>
      <ChevronDownIcon className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 opacity-50" />
    </div>
  )
}

export {
  SelectNative,
  SelectNative as Select,
  SelectNative as SelectContent,
}
