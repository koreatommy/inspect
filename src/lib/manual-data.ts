/** 아직 서비스에 반영되지 않은 기능 안내 문구 */
export const FEATURE_PLANNED_LABEL = "기능 추가 예정"

export const MANUAL_LAST_UPDATED = "2026-05-27"
export const MANUAL_VERSION = "1.0.0"
export const SERVICE_NAME = "어린이놀이시설 관리"

export type ManualTocItem = {
  id: string
  title: string
  description: string
  keywords?: string[]
}

export const manualTocItems: ManualTocItem[] = [
  {
    id: "getting-started",
    title: "시작하기",
    description: "매뉴얼 목적, 대상 사용자, 권장 환경",
    keywords: ["시작", "소개", "환경"],
  },
  {
    id: "overview",
    title: "서비스 개요",
    description: "서비스가 제공하는 핵심 기능 소개",
    keywords: ["개요", "기능"],
  },
  {
    id: "login-account",
    title: "로그인 및 계정 관리",
    description: "로그인, 비밀번호, 권한별 메뉴 접근",
    keywords: ["로그인", "계정", "비밀번호"],
  },
  {
    id: "dashboard",
    title: "대시보드 이해하기",
    description: "통계 카드, 최근 점검, 현황 파악",
    keywords: ["대시보드", "통계"],
  },
  {
    id: "facility-registration",
    title: "시설 정보 등록",
    description: "시설명, 주소, 놀이기구 등 기본 정보",
    keywords: ["시설", "등록", "JSON"],
  },
  {
    id: "inspection-targets",
    title: "점검 대상 관리",
    description: "점검 대상 시설 선택 및 데이터셋",
    keywords: ["점검 대상", "데이터셋"],
  },
  {
    id: "safety-inspection",
    title: "안전점검 작성",
    description: "월간 안전점검 항목별 상태 입력",
    keywords: ["점검", "작성", "월간"],
  },
  {
    id: "photos-notes",
    title: "사진 및 특이사항 입력",
    description: "특이사항 기록(사진 첨부는 기능 추가 예정)",
    keywords: ["사진", "특이사항", "첨부", "기능 추가 예정"],
  },
  {
    id: "inspection-results",
    title: "점검 결과 확인",
    description: "점검 완료 후 결과 조회",
    keywords: ["결과", "확인"],
  },
  {
    id: "ai-report",
    title: "AI 보고서 생성",
    description: "점검 데이터 기반 보고서 초안(기능 추가 예정)",
    keywords: ["AI", "보고서", "기능 추가 예정"],
  },
  {
    id: "pdf-download",
    title: "PDF 보고서 다운로드",
    description: "보고서 미리보기 및 PDF 저장",
    keywords: ["PDF", "다운로드", "인쇄"],
  },
  {
    id: "inspection-history",
    title: "점검 이력 관리",
    description: "시설별·기간별 점검 이력 조회",
    keywords: ["이력", "히스토리"],
  },
  {
    id: "user-permissions",
    title: "사용자 및 권한 관리",
    description: "역할별 접근 범위와 사용자 초대",
    keywords: ["사용자", "권한", "역할"],
  },
  {
    id: "data-export",
    title: "데이터보내기",
    description: "Excel·CSV 등 데이터 추출",
    keywords: ["보내기", "엑셀", "CSV"],
  },
  {
    id: "faq",
    title: "자주 묻는 질문",
    description: "FAQ",
    keywords: ["FAQ", "질문"],
  },
  {
    id: "troubleshooting",
    title: "문제 해결",
    description: "자주 발생하는 오류 대응",
    keywords: ["문제", "오류", "해결"],
  },
  {
    id: "changelog",
    title: "업데이트 이력",
    description: "매뉴얼 및 서비스 변경 사항",
    keywords: ["업데이트", "변경"],
  },
]

export type FAQItem = {
  id: string
  question: string
  answer: string
}

export const manualFaqItems: FAQItem[] = [
  {
    id: "faq-facility-edit",
    question: "시설 정보는 한 번 등록하면 수정할 수 있나요?",
    answer:
      "시설 정보는 관리자 권한에 따라 JSON 업로드 또는 데이터 관리 기능을 통해 갱신할 수 있습니다. 일반 점검자는 조회 위주로 사용하는 경우가 많으며, 수정 가능 여부는 조직의 운영 정책과 역할 설정에 따라 달라질 수 있습니다.",
  },
  {
    id: "faq-multiple-photos",
    question: "점검 중 사진을 여러 장 첨부할 수 있나요?",
    answer:
      "점검 항목별 사진 첨부 기능은 현재 개발 중이며, 추후 업데이트로 제공될 예정입니다. 공개 후에는 항목·화면 구성에 따라 여러 장을 등록할 수 있을 것으로 예상되며, 업로드 제한(용량·개수)은 서비스 설정 및 브라우저 환경에 따라 달라질 수 있습니다.",
  },
  {
    id: "faq-ai-auto",
    question: "AI 보고서는 자동으로 생성되나요?",
    answer:
      "AI 보고서 자동 생성 기능은 현재 개발 중이며, 추후 업데이트로 제공될 예정입니다. 기능이 공개되면 점검 데이터를 바탕으로 초안이 생성될 수 있으나, 최종 문구·수치·판정은 반드시 담당자가 검토·수정해야 합니다.",
  },
  {
    id: "faq-pdf-location",
    question: "PDF 보고서는 어디에서 다운로드하나요?",
    answer:
      "점검 완료 후 점검 상세 화면 또는 점검 이력 화면에서 보고서·PDF 관련 메뉴를 통해 다운로드할 수 있습니다. 메뉴 명칭과 위치는 화면 버전에 따라 다를 수 있으니, 해당 점검 건의 상세 페이지를 확인해 주세요.",
  },
  {
    id: "faq-invite-users",
    question: "사용자를 여러 명 초대할 수 있나요?",
    answer:
      "시스템 관리자(ADMIN) 권한을 가진 사용자는 설정 > 사용자 관리에서 여러 계정을 생성·관리할 수 있습니다. 초대 방식(이메일 직접 입력 등)은 관리자 설정에 따라 달라질 수 있습니다.",
  },
  {
    id: "faq-delete-history",
    question: "점검 이력은 삭제할 수 있나요?",
    answer:
      "점검 이력 삭제·수정 권한은 역할 및 조직 정책에 따라 제한될 수 있습니다. 삭제가 필요한 경우 관리자에게 문의하거나, 운영 매뉴얼에 정의된 절차를 따르시기 바랍니다.",
  },
  {
    id: "faq-same-facility-datasets",
    question: "같은 시설번호를 여러 데이터셋에서 사용할 수 있나요?",
    answer:
      "데이터셋(시설정보 사용자화) 기능을 사용하는 경우, 동일 시설이 서로 다른 데이터셋에 소속될 수 있습니다. 표시되는 시설 목록은 로그인한 사용자에게 할당된 데이터셋 범위에 따라 달라질 수 있습니다.",
  },
]

export type UpdateEntry = {
  date: string
  version: string
  changes: string[]
}

export const manualUpdateHistory: UpdateEntry[] = [
  {
    date: "2026-05-27",
    version: "1.0.0",
    changes: [
      "온라인 사용자 매뉴얼 최초 공개",
      "시설정보 데이터셋 사용자화 관련 안내 추가",
      "점검 작성 단계별 가이드 및 FAQ 반영",
      "사진 첨부·AI 보고서 미구현 상태를 「기능 추가 예정」으로 명시",
    ],
  },
]

export type StepItem = {
  title: string
  description: string
  /** true이면 UI에 「기능 추가 예정」 표시 */
  planned?: boolean
}

export const inspectionStepGuide: StepItem[] = [
  {
    title: "시설 선택",
    description: "점검 대상 시설을 목록에서 선택합니다. 할당된 데이터셋 범위 내 시설만 표시될 수 있습니다.",
  },
  {
    title: "점검일자 입력",
    description: "실제 현장 점검일을 확인·입력합니다.",
  },
  {
    title: "점검 항목 확인",
    description: "월간 안전점검 항목 목록을 확인하고 점검 기준을 숙지합니다.",
  },
  {
    title: "상태 선택",
    description: "항목별로 양호, 요주의, 요수리, 이용금지·조치필요 등 해당 상태를 선택합니다.",
  },
  {
    title: "사진 첨부",
    description:
      "필요한 항목에 현장 사진을 첨부합니다. (현재 미구현, 추후 제공 예정)",
    planned: true,
  },
  {
    title: "특이사항 입력",
    description: "현장에서 확인한 특이사항·조치 필요 내용을 기록합니다.",
  },
  {
    title: "저장",
    description: "입력 내용을 저장합니다. 임시 저장과 최종 저장 방식은 화면 구성에 따라 다를 수 있습니다.",
  },
  {
    title: "AI 보고서 생성",
    description:
      "점검 데이터 기반 보고서 초안 생성. (현재 미구현, 추후 제공 예정)",
    planned: true,
  },
  {
    title: "PDF 다운로드",
    description:
      "점검 완료 후 PDF 등 후속 출력·다운로드 작업을 진행합니다.",
  },
]
