import type { FacilityRow } from "@/types/database"

const fields: Array<[string, keyof FacilityRow]> = [
  ["시설번호", "facility_no"],
  ["시설명", "facility_name"],
  ["주소", "road_address"],
  ["지번주소", "lot_address"],
  ["설치일자", "installed_date"],
  ["설치장소", "install_place_name"],
  ["의무/비의무", "duty_type_name"],
  ["공공/민간", "public_private_name"],
  ["운영 여부", "operation_status_name"],
  ["실내/실외", "indoor_outdoor_name"],
  ["면적", "facility_area"],
  ["지역명", "region_name"],
]

export function BasicInfoTab({ facility }: { facility: FacilityRow }) {
  return (
    <dl className="grid gap-3 md:grid-cols-2">
      {fields.map(([label, key]) => (
        <div key={key} className="rounded-lg border p-3">
          <dt className="text-xs text-muted-foreground">{label}</dt>
          <dd className="mt-1 font-medium">{String(facility[key] ?? "-")}</dd>
        </div>
      ))}
    </dl>
  )
}
