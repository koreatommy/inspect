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

/** 시설 상세 탭: 클릭 영역·간격·호버를 두어 구분감을 높임 */
const facilityTabTriggerClassName = cn(
  "min-h-10 shrink-0 px-3.5 py-2.5 text-sm font-medium sm:px-4",
  "text-muted-foreground transition-[color,background-color]",
  "rounded-md hover:bg-muted/90 hover:text-foreground",
  "data-active:text-foreground"
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
      <TabsList
        variant="line"
        className={cn(
          "mb-4 w-full flex-wrap items-end justify-start",
          "gap-x-2 gap-y-1.5 sm:gap-x-3",
          "border-b border-border bg-transparent pb-px",
          "h-auto min-h-0 p-0"
        )}
      >
        <TabsTrigger value="basic" className={facilityTabTriggerClassName}>
          기본정보
        </TabsTrigger>
        <TabsTrigger value="equipment" className={facilityTabTriggerClassName}>
          놀이기구
        </TabsTrigger>
        <TabsTrigger value="legal" className={facilityTabTriggerClassName}>
          정기시설검사
        </TabsTrigger>
        <TabsTrigger value="education" className={facilityTabTriggerClassName}>
          안전교육
        </TabsTrigger>
        <TabsTrigger value="insurance" className={facilityTabTriggerClassName}>
          보험가입
        </TabsTrigger>
        <TabsTrigger value="manager" className={facilityTabTriggerClassName}>
          관리주체
        </TabsTrigger>
        <TabsTrigger value="history" className={facilityTabTriggerClassName}>
          월간점검 이력
        </TabsTrigger>
      </TabsList>
      <Card>
        <CardContent className="pt-4">
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
            <MonthlyInspectionHistoryTab inspections={monthlyInspections} />
          </TabsContent>
        </CardContent>
      </Card>
    </Tabs>
  )
}
