import Link from "next/link"
import { notFound } from "next/navigation"

import { getCurrentRole } from "@/lib/auth/helpers"
import { hasPermission } from "@/lib/auth/permissions"
import { LedgerMobileSummary } from "@/components/ledger/ledger-mobile-summary"
import { LedgerTable, type LedgerDisplayRow } from "@/components/ledger/ledger-table"
import { PrintButton } from "@/components/ledger/print-button"
import { PrintLayout } from "@/components/ledger/print-layout"
import { buttonVariants } from "@/components/ui/button"
import { loadCumulativeLedgerRowsByMonth } from "@/lib/inspection/cumulative-ledger"
import { omitRenderedAt } from "@/lib/inspection/ledger-display"
import { ledgerPrintDocumentTitle } from "@/lib/inspection/ledger-print-title"
import { buildLedgerRow } from "@/lib/inspection/snapshot"
import { createClient } from "@/lib/supabase/server"
import { cn } from "@/lib/utils"

type LedgerPageProps = {
  params: Promise<{
    inspectionId: string
  }>
}

async function getSignedUrl(path: string | null | undefined) {
  if (!path) {
    return null
  }

  const supabase = await createClient()
  const { data } = await supabase.storage
    .from("signatures")
    .createSignedUrl(path, 60 * 10)

  return data?.signedUrl ?? null
}

export default async function LedgerPage({ params }: LedgerPageProps) {
  const { inspectionId } = await params
  const role = await getCurrentRole()
  const supabase = await createClient()

  const [{ data: inspection }, { data: storedLedger }, { data: items }] =
    await Promise.all([
      supabase
        .from("monthly_inspections")
        .select("*")
        .eq("id", inspectionId)
        .maybeSingle(),
      supabase
        .from("inspection_ledger_rows")
        .select("*")
        .eq("inspection_id", inspectionId)
        .maybeSingle(),
      supabase
        .from("monthly_inspection_items")
        .select("*")
        .eq("inspection_id", inspectionId)
        .order("sort_order", { ascending: true }),
    ])

  if (!inspection) {
    notFound()
  }

  const { data: facility } = await supabase
    .from("facilities")
    .select("facility_name,road_address")
    .eq("facility_no", inspection.facility_no)
    .maybeSingle()

  if (!facility) {
    notFound()
  }

  const { endMonth, rowsByMonth } = await loadCumulativeLedgerRowsByMonth(
    supabase,
    {
      facilityNo: inspection.facility_no,
      anchorInspectionId: inspectionId,
      anchorInspection: inspection,
      facility,
      anchorItems: items ?? [],
      anchorStoredLedger: storedLedger,
    }
  )

  const paths = new Set<string>()
  for (const r of rowsByMonth.values()) {
    if (r.safety_manager_signature_url) {
      paths.add(r.safety_manager_signature_url)
    }
    if (r.consigned_inspector_signature_url) {
      paths.add(r.consigned_inspector_signature_url)
    }
  }

  const signedUrlByPath = new Map<string, string | null>()
  await Promise.all(
    [...paths].map(async (p) => {
      signedUrlByPath.set(p, await getSignedUrl(p))
    })
  )

  function attachSignatureUrls(r: LedgerDisplayRow): LedgerDisplayRow {
    return {
      ...r,
      safetyManagerSignatureSrc: r.safety_manager_signature_url
        ? (signedUrlByPath.get(r.safety_manager_signature_url) ?? null)
        : null,
      consignedInspectorSignatureSrc: r.consigned_inspector_signature_url
        ? (signedUrlByPath.get(r.consigned_inspector_signature_url) ?? null)
        : null,
    }
  }

  const rowsByMonthSigned = new Map(
    [...rowsByMonth.entries()].map(([mo, r]) => [mo, attachSignatureUrls(r)])
  )

  const row: LedgerDisplayRow =
    rowsByMonthSigned.get(endMonth) ??
    attachSignatureUrls(
      storedLedger
        ? omitRenderedAt(storedLedger)
        : buildLedgerRow({
            inspection,
            facility,
            items: items ?? [],
          })
    )

  const isLocked = inspection.status === "locked"
  const canEditInspection =
    inspection.status === "completed"
      ? hasPermission(role, "inspection:edit-completed")
      : hasPermission(role, "inspection:edit")
  const showEditButton = !isLocked && canEditInspection

  return (
    <div className="space-y-4 print:space-y-0">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold tracking-tight md:text-2xl">
            안전점검실시대장 미리보기
          </h2>
          <p className="text-sm text-muted-foreground">
            해당 점검월이 속한 연도의 1월부터 점검월까지 완료된 점검은
            스냅샷·이력을, 현재 작성 중인 월은 입력값 기준으로 함께
            표시합니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {showEditButton ? (
            <Link
              href={`/inspections/${inspectionId}`}
              className={cn(buttonVariants({ variant: "outline" }))}
            >
              수정
            </Link>
          ) : null}
          <PrintButton
            documentTitleForPdf={ledgerPrintDocumentTitle(
              row.facility_no,
              inspection.inspection_month
            )}
          />
        </div>
      </div>

      <LedgerMobileSummary rowsByMonth={rowsByMonthSigned} />

      <PrintLayout>
        <div className="ledger-header-area shrink-0">
          <div className="mb-3 flex justify-between text-xs text-zinc-600 print:mb-2 print:text-[10px]">
            <span>어린이놀이시설 안전관리법 시행규칙 [별지 제16호서식]</span>
          </div>
          <h1 className="mb-3 text-center text-xl font-bold text-zinc-950 print:mb-2 print:text-lg">
            안전점검실시대장(제17조 관련)
          </h1>
          <div className="mb-4 ml-auto w-80 max-w-full border border-zinc-900 text-sm text-zinc-950 print:mb-3 print:w-[72mm] print:text-[10px]">
            <div className="grid grid-cols-[110px_1fr] border-b border-zinc-900 print:grid-cols-[26mm_1fr]">
              <div className="border-r border-zinc-900 bg-zinc-100 p-2 text-center font-medium print:px-1 print:py-0.5">
                시설명
              </div>
              <div className="p-2 print:px-1 print:py-0.5">
                {row.facility_name_snapshot}
              </div>
            </div>
            <div className="grid grid-cols-[110px_1fr] print:grid-cols-[26mm_1fr]">
              <div className="border-r border-zinc-900 bg-zinc-100 p-2 text-center font-medium print:px-1 print:py-0.5">
                시설번호
              </div>
              <div className="p-2 print:px-1 print:py-0.5">{row.facility_no}</div>
            </div>
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col">
          <LedgerTable rowsByMonth={rowsByMonthSigned} />
        </div>
      </PrintLayout>
    </div>
  )
}
