"use client"

import { useMediaQuery } from "@/hooks/use-media-query"
import type { MonthlyInspectionItemRow } from "@/types/database"

import { EquipmentDesktopTable } from "./equipment-desktop-table"
import { EquipmentMobileList } from "./equipment-mobile-list"

export function EquipmentInspectionTable({
  items,
  disabled = false,
}: {
  items: MonthlyInspectionItemRow[]
  disabled?: boolean
}) {
  const isMdUp = useMediaQuery("(min-width: 768px)", true)

  if (isMdUp) {
    return <EquipmentDesktopTable items={items} disabled={disabled} />
  }

  return <EquipmentMobileList items={items} disabled={disabled} />
}
