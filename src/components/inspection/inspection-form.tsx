import Link from "next/link"

import {
  completeInspection,
  saveInspectionDraft,
  saveInspectionDraftAndOpenLedger,
} from "@/app/(dashboard)/inspections/[inspectionId]/actions"
import { Button, buttonVariants } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { hasPermission } from "@/lib/auth/permissions"
import { cn } from "@/lib/utils"
import type {
  MonthlyInspectionItemRow,
  MonthlyInspectionRow,
} from "@/types/database"
import type { AppRole } from "@/types/inspection"
import { EquipmentInspectionTable } from "./equipment-table"
import { SignaturePad } from "./signature-pad"

type InspectionFormProps = {
  inspection: MonthlyInspectionRow
  items: MonthlyInspectionItemRow[]
  role: AppRole
}

export function InspectionForm({
  inspection,
  items,
  role,
}: InspectionFormProps) {
  const canSignSafetyManager = hasPermission(
    role,
    "inspection:sign-safety-manager"
  )
  const canSignConsignedInspector = hasPermission(
    role,
    "inspection:sign-consigned-inspector"
  )
  const canComplete = hasPermission(role, "inspection:complete")
  const isCompleted =
    inspection.status === "completed" || inspection.status === "locked"
  const isReadOnly = isCompleted && role !== "ADMIN"

  return (
    <form action={saveInspectionDraft} className="space-y-6">
      <input type="hidden" name="inspectionId" value={inspection.id} />
      <Card>
        <CardHeader>
          <CardTitle>기구별 점검 결과</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentInspectionTable items={items} disabled={isReadOnly} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>점검자 및 서명</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <label htmlFor="safetyManagerName" className="text-sm font-medium">
                안전관리자명
              </label>
              <Input
                id="safetyManagerName"
                name="safetyManagerName"
                defaultValue={inspection.safety_manager_name ?? ""}
                disabled={!canSignSafetyManager || isReadOnly}
              />
            </div>
            <div className="space-y-2">
              <label
                htmlFor="consignedInspectorName"
                className="text-sm font-medium"
              >
                위탁점검자명
              </label>
              <Input
                id="consignedInspectorName"
                name="consignedInspectorName"
                defaultValue={inspection.consigned_inspector_name ?? ""}
                disabled={!canSignConsignedInspector || isReadOnly}
              />
            </div>
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {canSignSafetyManager && !isReadOnly ? (
              <SignaturePad
                name="safetyManagerSignature"
                label="안전관리자 서명"
              />
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">안전관리자 서명</label>
                <p className="rounded-lg border bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
                  {inspection.safety_manager_signature_url
                    ? "서명 완료"
                    : "이 계정으로는 안전관리자 서명을 입력할 수 없습니다."}
                </p>
              </div>
            )}
            {canSignConsignedInspector && !isReadOnly ? (
              <SignaturePad
                name="consignedInspectorSignature"
                label="위탁점검자 서명"
              />
            ) : (
              <div className="space-y-2">
                <label className="text-sm font-medium">위탁점검자 서명</label>
                <p className="rounded-lg border bg-muted/50 px-3 py-8 text-center text-sm text-muted-foreground">
                  {inspection.consigned_inspector_signature_url
                    ? "서명 완료"
                    : "서명 권한이 없습니다"}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-col gap-2">
        <div className="grid gap-2 sm:flex sm:flex-wrap">
          {!isReadOnly && (
            <Button type="submit" variant="outline" className="w-full sm:w-auto">
              임시저장
            </Button>
          )}
          {canComplete && !isReadOnly && (
            <Button
              type="submit"
              formAction={completeInspection}
              className="w-full sm:w-auto"
            >
              점검완료
            </Button>
          )}
          {!isReadOnly ? (
            <Button
              type="submit"
              variant="outline"
              formAction={saveInspectionDraftAndOpenLedger}
              className="w-full sm:w-auto"
            >
              대장 미리보기
            </Button>
          ) : (
            <Link
              href={`/inspections/${inspection.id}/ledger`}
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full sm:w-auto"
              )}
            >
              대장 미리보기
            </Link>
          )}
        </div>
        {!isReadOnly ? (
          <p className="text-xs text-muted-foreground">
            「대장 미리보기」는 현재 입력·서명을 저장한 뒤 미리보기 화면으로
            이동합니다. 별도로 「임시저장」을 누르지 않아도 됩니다.
          </p>
        ) : null}
      </div>
    </form>
  )
}
