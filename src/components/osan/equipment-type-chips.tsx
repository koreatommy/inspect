"use client"

import type { ReactNode } from "react"
import { Check } from "lucide-react"

import {
  isCommonEquipmentType,
  parseEquipmentChipLabel,
  splitEquipmentTypes,
} from "@/lib/osan/facility-equipment"
import { cn } from "@/lib/utils"

type Props = {
  types: string[]
  selected: string | null | undefined
  disabled?: boolean
  onSelect: (type: string) => void
  /** 시트용: 섹션 제목·총 기구 수 표시 + 3열 그리드 */
  showSectionHeaders?: boolean
  totalCount?: number
  emptyMessage?: string
  size?: "sm" | "md"
}

export function EquipmentTypeChips({
  types,
  selected,
  disabled,
  onSelect,
  showSectionHeaders = false,
  totalCount,
  emptyMessage = "등록된 기구유형이 없습니다.",
  size = "md",
}: Props) {
  const { equipmentTypes, commonTypes } = splitEquipmentTypes(types)
  const useGrid = showSectionHeaders

  if (types.length === 0) {
    return <p className="text-xs text-muted-foreground">{emptyMessage}</p>
  }

  return (
    <div className="space-y-3">
      <TypeGroup
        title={showSectionHeaders ? "기구유형" : undefined}
        hint={
          showSectionHeaders && totalCount != null
            ? `총 ${totalCount}개 기구`
            : undefined
        }
        types={equipmentTypes}
        selected={selected}
        disabled={disabled}
        onSelect={onSelect}
        size={size}
        layout={useGrid ? "equipment-grid" : "chips"}
        emptyFallback={
          showSectionHeaders ? (
            <p className="text-xs text-muted-foreground">{emptyMessage}</p>
          ) : null
        }
      />
      {commonTypes.length > 0 ? (
        <TypeGroup
          title={showSectionHeaders ? "공통" : undefined}
          hint={showSectionHeaders ? "전경 · 안내 · 부대" : undefined}
          types={commonTypes}
          selected={selected}
          disabled={disabled}
          onSelect={onSelect}
          size={size}
          layout={useGrid ? "common-grid" : "chips"}
          common
        />
      ) : null}
    </div>
  )
}

function TypeGroup({
  title,
  hint,
  types,
  selected,
  disabled,
  onSelect,
  size,
  layout = "chips",
  common = false,
  emptyFallback = null,
}: {
  title?: string
  hint?: string
  types: string[]
  selected: string | null | undefined
  disabled?: boolean
  onSelect: (type: string) => void
  size: "sm" | "md"
  layout?: "chips" | "equipment-grid" | "common-grid"
  common?: boolean
  emptyFallback?: ReactNode
}) {
  if (types.length === 0) return emptyFallback

  return (
    <div className="space-y-1.5">
      {title ? (
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-sm font-semibold">{title}</h3>
          {hint ? (
            <span className="text-[11px] text-muted-foreground">{hint}</span>
          ) : null}
        </div>
      ) : null}

      {layout === "equipment-grid" ? (
        <div className="grid grid-cols-3 gap-2">
          {types.map((type) => {
            const isSelected = selected === type
            const { name, equipmentNo } = parseEquipmentChipLabel(type)
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(type)}
                aria-pressed={isSelected}
                className={cn(
                  "relative flex min-h-[4.5rem] flex-col items-center justify-center gap-1 rounded-xl border px-1.5 py-2 text-center touch-manipulation disabled:opacity-50",
                  isSelected
                    ? "border-foreground bg-foreground text-background"
                    : "border-input bg-muted/40 text-foreground active:scale-[0.98]",
                )}
              >
                {isSelected ? (
                  <span
                    className="absolute top-1.5 right-1.5 flex size-4 items-center justify-center rounded-full bg-background text-foreground"
                    aria-hidden
                  >
                    <Check className="size-2.5" strokeWidth={3} />
                  </span>
                ) : null}
                <span className="line-clamp-2 text-[11px] font-medium leading-snug break-keep">
                  {name}
                </span>
                {equipmentNo ? (
                  <span
                    className={cn(
                      "font-mono text-[10px] tabular-nums leading-none",
                      isSelected
                        ? "text-background/70"
                        : "text-muted-foreground",
                    )}
                  >
                    {equipmentNo}
                  </span>
                ) : null}
              </button>
            )
          })}
        </div>
      ) : layout === "common-grid" ? (
        <div className="grid grid-cols-3 gap-2">
          {types.map((type) => {
            const isSelected = selected === type
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(type)}
                aria-pressed={isSelected}
                className={cn(
                  "min-h-11 rounded-xl border px-2 py-2.5 text-center text-xs font-medium leading-snug break-keep touch-manipulation disabled:opacity-50",
                  isSelected
                    ? "border-sky-700 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-500"
                    : "border-dashed border-sky-600/50 bg-sky-500/10 text-sky-900 active:scale-[0.98] dark:border-sky-400/50 dark:bg-sky-400/10 dark:text-sky-100",
                )}
              >
                {type}
              </button>
            )
          })}
        </div>
      ) : (
        <div className="flex flex-wrap gap-1.5">
          {types.map((type) => {
            const isSelected = selected === type
            const isCommon = common || isCommonEquipmentType(type)
            return (
              <button
                key={type}
                type="button"
                disabled={disabled}
                onClick={() => onSelect(type)}
                aria-pressed={isSelected}
                className={cn(
                  "border font-medium disabled:opacity-50",
                  size === "sm"
                    ? "rounded-full px-2 py-1 text-[11px]"
                    : "rounded-full px-2.5 py-1.5 text-xs",
                  isSelected
                    ? isCommon
                      ? "border-sky-700 bg-sky-700 text-white dark:border-sky-500 dark:bg-sky-500"
                      : "border-foreground bg-foreground text-background"
                    : isCommon
                      ? "border-dashed border-sky-600/50 bg-sky-500/10 text-sky-900 dark:border-sky-400/50 dark:bg-sky-400/10 dark:text-sky-100"
                      : "border-input bg-muted/40 text-foreground",
                )}
              >
                {type}
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
