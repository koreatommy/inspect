"use client"

import { Menu } from "lucide-react"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import type { AppRole } from "@/types/inspection"

import { SidebarNav } from "./sidebar-nav"

export function Sidebar({ role }: { role: AppRole }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r bg-sidebar px-3 py-4 text-sidebar-foreground print:hidden lg:flex lg:flex-col">
      <SidebarNav role={role} />
    </aside>
  )
}

export function MobileSidebarTrigger({ role }: { role: AppRole }) {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="size-8 lg:hidden"
        onClick={() => setOpen(true)}
        aria-label="메뉴 열기"
      >
        <Menu className="size-5" />
      </Button>

      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent side="left" className="w-72 bg-sidebar p-4">
          <SheetHeader className="sr-only">
            <SheetTitle>내비게이션 메뉴</SheetTitle>
          </SheetHeader>
          <SidebarNav role={role} onLinkClick={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
    </>
  )
}
