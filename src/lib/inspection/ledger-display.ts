import type { LedgerDisplayRow } from "@/components/ledger/ledger-table"
import type { LedgerRow } from "@/types/database"

export function omitRenderedAt(row: LedgerRow): LedgerDisplayRow {
  const { rendered_at, ...rest } = row
  void rendered_at
  return rest
}
