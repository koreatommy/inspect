"use client"

import { Card, CardContent } from "@/components/ui/card"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { cn } from "@/lib/utils"
import type {
  EquipmentRow,
  FacilityLegalInspectionRow,
  FacilityManagerRow,
  FacilityRow,
  LiabilityInsuranceRow,
  MonthlyInspectionRow,
  SafetyEducationRow,
} from "@/types/database"
import { BasicInfoTab } from "./basic-info-tab"
import { EquipmentTab } from "./equipment-tab"
import { FacilityManagerTab } from "./facility-manager-tab"
import { LegalInspectionTab } from "./legal-inspection-tab"
import { LiabilityInsuranceTab } from "./liability-insurance-tab"
import { MonthlyInspectionHistoryTab } from "./monthly-inspection-history-tab"
import { SafetyEducationTab } from "./safety-education-tab"

const triggerCls = cn(
  "!h-auto !flex-none !rounded-none !border-0 !bg-transparent !shadow-none",
  "relative px-4 py-3 text-sm font-medium whitespace-nowrap",
  "text-muted-foreground transition-colors duration-150",
  "hover:text-primary",
  "data-active:text-primary data-active:font-semibold",
  "after:absolute after:inset-x-0 after:bottom-0 after:h-0.5",
  "after:scale-x-0 after:bg-primary after:transition-transform after:duration-200",
  "data-active:after:scale-x-100"
)

export function FacilityTabs({
  facility,
  equipment,
  legalInspections,
  safetyEducations,
  liabilityInsurances,
  facilityManagers,
  monthlyInspections,
}: {
  facility: FacilityRow
  equipment: EquipmentRow[]
  legalInspections: FacilityLegalInspectionRow[]
  safetyEducations: SafetyEducationRow[]
  liabilityInsurances: LiabilityInsuranceRow[]
  facilityManagers: FacilityManagerRow[]
  monthlyInspections: MonthlyInspectionRow[]
}) {
  return (
    <Tabs defaultValue="basic">
      <div className="overflow-x-auto">
        <TabsList
          variant="line"
          className={cn(
            "!inline-flex w-full items-stretch justify-start gap-0",
            "!h-auto !min-h-0 !rounded-none border-b-2 border-border !bg-transparent !p-0"
          )}
        >
          <TabsTrigger value="basic" className={triggerCls}>
            기본정보
          </TabsTrigger>
          <TabsTrigger value="equipment" className={triggerCls}>
            놀이기구
          </TabsTrigger>
          <TabsTrigger value="legal" className={triggerCls}>
            정기시설검사
          </TabsTrigger>
          <TabsTrigger value="education" className={triggerCls}>
            안전교육
          </TabsTrigger>
          <TabsTrigger value="insurance" className={triggerCls}>
            보험가입
          </TabsTrigger>
          <TabsTrigger value="manager" className={triggerCls}>
            관리주체
          </TabsTrigger>
          <TabsTrigger value="history" className={triggerCls}>
            월간점검 이력
          </TabsTrigger>
        </TabsList>
      </div>

      <Card className="mt-4 border-border/60 shadow-sm">
        <CardContent className="pt-5">
          <TabsContent value="basic">
            <BasicInfoTab facility={facility} />
          </TabsContent>
          <TabsContent value="equipment">
            <EquipmentTab equipment={equipment} />
          </TabsContent>
          <TabsContent value="legal">
            <LegalInspectionTab rows={legalInspections} />
          </TabsContent>
          <TabsContent value="education">
            <SafetyEducationTab rows={safetyEducations} />
          </TabsContent>
          <TabsContent value="insurance">
            <LiabilityInsuranceTab rows={liabilityInsurances} />
          </TabsContent>
          <TabsContent value="manager">
            <FacilityManagerTab rows={facilityManagers} />
          </TabsContent>
          <TabsContent value="history">
            <MonthlyInspectionHistoryTab
              inspections={monthlyInspections}
              facilityNo={facility.facility_no}
            />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}
