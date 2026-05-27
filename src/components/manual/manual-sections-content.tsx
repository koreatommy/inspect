import {
  RolePermissionMatrix,
  RolePermissionMatrixLegend,
  RolePermissionPolicyNotes,
} from "@/app/(dashboard)/settings/role-permission-matrix"
import { Check } from "lucide-react"
import { ManualCallout } from "@/components/manual/manual-callout"
import { ManualFAQ } from "@/components/manual/manual-faq"
import { ManualSection } from "@/components/manual/manual-section"
import { ManualStepGuide } from "@/components/manual/manual-step-guide"
import { ManualUpdateHistory } from "@/components/manual/manual-update-history"
import { ROLE_LABELS } from "@/lib/auth/permissions"
import {
  inspectionStepGuide,
  manualFaqItems,
  manualTocItems,
  manualUpdateHistory,
  SERVICE_NAME,
} from "@/lib/manual-data"

type ManualSectionsContentProps = {
  hiddenSectionIds: Set<string>
}

function isHidden(hidden: Set<string>, id: string) {
  return hidden.has(id)
}

export function ManualSectionsContent({
  hiddenSectionIds,
}: ManualSectionsContentProps) {
  return (
    <div className="min-w-0 flex-1 space-y-10">
      <ManualSection
        id="getting-started"
        title="1. 시작하기"
        description={manualTocItems[0]?.description}
        hidden={isHidden(hiddenSectionIds, "getting-started")}
      >
        <p>
          본 매뉴얼은 <strong>{SERVICE_NAME}</strong> 서비스(어린이놀이시설
          안전점검 SaaS)를 효과적으로 사용하기 위한 온라인 안내 문서입니다.
        </p>
        <ManualCallout variant="info" title="대상 사용자">
          <ul className="list-inside list-disc space-y-1">
            <li>
              <strong>관리자:</strong> 시설 데이터 업로드, 사용자·데이터셋 관리
            </li>
            <li>
              <strong>점검자:</strong> 현장 점검 작성·특이사항 기록·결과 저장
              (사진 첨부는 기능 추가 예정)
            </li>
            <li>
              <strong>기관 담당자:</strong> 점검 이력 조회, 보고서 확인
            </li>
          </ul>
        </ManualCallout>
        <p>
          <strong>권장 사용 환경:</strong> PC 브라우저(Chrome, Edge, Safari
          최신 버전)를 권장합니다. 태블릿·모바일에서도 조회·입력이 가능하나,
          보고서·PDF 확인은 PC 환경이 더 편리할 수 있습니다. 사진 첨부 기능은
          추후 제공될 예정입니다.
        </p>
      </ManualSection>

      <ManualSection
        id="overview"
        title="2. 서비스 개요"
        hidden={isHidden(hiddenSectionIds, "overview")}
      >
        <p>본 서비스는 다음 업무 흐름을 지원합니다.</p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>어린이놀이시설 정보 등록·관리</li>
          <li>점검 항목에 따른 월간 안전점검 수행</li>
          <li>점검 결과·특이사항 저장 (사진 첨부는 기능 추가 예정)</li>
          <li>점검 이력 조회 및 관리</li>
          <li>필요 시 보고서 출력·다운로드</li>
        </ul>
        <ManualCallout variant="tip">
          사이드바의 「대시보드」「시설 목록」「월간 안전점검」「안전점검
          이력」 메뉴가 일반적인 업무 흐름의 중심입니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="login-account"
        title="3. 로그인 및 계정 관리"
        hidden={isHidden(hiddenSectionIds, "login-account")}
      >
        <p>
          발급받은 이메일과 비밀번호로 로그인합니다. 계정이 정지된 경우 로그인이
          제한될 수 있습니다.
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>비밀번호 변경: 설정 &gt; 내정보 관리</li>
          <li>조직·기관 단위 접근: 관리자가 사용자·데이터셋을 할당</li>
        </ul>
        <ManualCallout variant="warning">
          역할(관리자, 점검자, 열람자 등)에 따라 접근 가능한 메뉴 범위가
          달라집니다. 보이지 않는 메뉴가 있다면 권한을 확인해 주세요.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="dashboard"
        title="4. 대시보드 이해하기"
        hidden={isHidden(hiddenSectionIds, "dashboard")}
      >
        <p>
          대시보드에서는 할당된 데이터셋 범위 내 시설·점검 현황을 한눈에
          파악할 수 있습니다.
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>전체 시설 수 및 점검 완료·미점검 현황</li>
          <li>최근 점검 이력</li>
          <li>월별 점검 결과 통계(차트)</li>
          <li>조치가 필요한 항목 요약(표시되는 경우)</li>
        </ul>
        <ManualCallout variant="info">
          화면에 표시되는 수치·차트는 로그인한 사용자의 데이터셋 할당 및
          실제 등록된 점검 데이터에 따라 달라집니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="facility-registration"
        title="5. 시설 정보 등록"
        hidden={isHidden(hiddenSectionIds, "facility-registration")}
      >
        <p>
          시설 정보는 관리자가 JSON 업로드 등을 통해 등록·갱신하는 경우가
          많습니다. 일반적으로 다음 항목이 포함됩니다.
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>시설명, 시설번호, 주소, 설치장소</li>
          <li>관리주체, 담당자 정보</li>
          <li>놀이기구 정보, 비고</li>
        </ul>
        <ManualCallout variant="important">
          시설 데이터 변경은 점검·보고서에 영향을 줄 수 있습니다. 운영
          절차에 따라 백업 후 업로드하시기 바랍니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="inspection-targets"
        title="6. 점검 대상 관리"
        hidden={isHidden(hiddenSectionIds, "inspection-targets")}
      >
        <p>
          「시설 목록」에서 점검 대상 시설을 확인합니다. 데이터셋 기능을
          사용하는 경우, 사용자에게 할당된 데이터셋에 속한 시설만 표시될 수
          있습니다.
        </p>
        <ManualCallout variant="info">
          동일 시설번호가 여러 데이터셋에 존재할 수 있으며, 표시 범위는
          관리자 설정에 따라 달라질 수 있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="safety-inspection"
        title="7. 안전점검 작성"
        hidden={isHidden(hiddenSectionIds, "safety-inspection")}
      >
        <p>
          「월간 안전점검」 메뉴에서 점검을 시작합니다. 항목별로 점검 기준을
          확인한 뒤 상태를 선택합니다.
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>양호, 요주의, 요수리, 이용금지·조치필요 등</li>
          <li>임시 저장·최종 저장 방식은 화면에 따라 다를 수 있음</li>
        </ul>
        <h3 className="pt-2 font-medium text-foreground">
          점검 작성 단계별 가이드
        </h3>
        <ManualStepGuide steps={inspectionStepGuide} />
      </ManualSection>

      <ManualSection
        id="photos-notes"
        title="8. 사진 및 특이사항 입력"
        planned
        hidden={isHidden(hiddenSectionIds, "photos-notes")}
      >
        <ManualCallout variant="planned">
          점검 항목별 <strong>사진 첨부</strong> 기능은 현재 서비스에
          구현되어 있지 않으며, 추후 업데이트로 제공될 예정입니다. 아래
          안내는 기능 공개 후 참고용입니다.
        </ManualCallout>
        <p>
          현재는 특이사항·조치 필요 내용을 텍스트로 기록할 수 있습니다. 사진
          첨부가 제공되면 현장에서 촬영한 사진을 해당 점검 항목에 연결하는
          방식으로 사용할 예정입니다.
        </p>
        <ManualCallout variant="tip" title="기능 공개 후 참고">
          사진은 용량·해상도에 따라 업로드 시간이 길어질 수 있습니다. Wi-Fi
          환경에서 저장하는 것을 권장합니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="inspection-results"
        title="9. 점검 결과 확인"
        hidden={isHidden(hiddenSectionIds, "inspection-results")}
      >
        <p>
          점검 저장 후 해당 건의 상세 화면 또는 「안전점검 이력」에서 결과를
          확인할 수 있습니다. 항목별 상태·특이사항을 검토하세요. (사진은
          기능 추가 예정)
        </p>
      </ManualSection>

      <ManualSection
        id="ai-report"
        title="10. AI 보고서 생성"
        planned
        hidden={isHidden(hiddenSectionIds, "ai-report")}
      >
        <ManualCallout variant="planned">
          <strong>AI 보고서 자동 생성</strong> 기능은 현재 서비스에
          구현되어 있지 않으며, 추후 업데이트로 제공될 예정입니다.
        </ManualCallout>
        <p>
          기능이 공개되면 점검 데이터를 바탕으로 보고서 초안이 생성될 수
          있습니다. 아래 안내는 제공 시점 이후 운영 원칙입니다.
        </p>
        <ManualCallout variant="important" title="최종 검토 필수 (기능 공개 후)">
          AI가 생성한 문구·판정은 참고용입니다. 제출·보관 전 반드시
          담당 관리자 또는 점검자가 내용을 검토·수정해야 하며, 최종 책임은
          점검 수행 기관에 있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="pdf-download"
        title="11. PDF 보고서 다운로드"
        hidden={isHidden(hiddenSectionIds, "pdf-download")}
      >
        <p>
          점검 상세·이력 화면에서 보고서 미리보기 및 PDF 다운로드를 진행할 수
          있습니다. 기관 제출용으로 파일을 보관하세요.
        </p>
        <ManualCallout variant="tip">
          인쇄 시 브라우저 인쇄 설정에서 「배경 그래픽」을 켜면 레이아웃이
          더 정확하게 출력될 수 있습니다. 본 매뉴얼 상단의 「인쇄 / PDF」
          버튼도 활용할 수 있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="inspection-history"
        title="12. 점검 이력 관리"
        hidden={isHidden(hiddenSectionIds, "inspection-history")}
      >
        <p>「안전점검 이력」에서 과거 점검을 조회합니다.</p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>시설별·기간별 필터(제공되는 경우)</li>
          <li>상태별 필터</li>
          <li>보고서 재다운로드</li>
          <li>이전 점검과의 비교(기능 제공 시)</li>
        </ul>
      </ManualSection>

      <ManualSection
        id="user-permissions-overview"
        title="13. 사용자 및 권한 · 개요"
        description="역할별 접근 범위를 이해합니다"
        hidden={isHidden(hiddenSectionIds, "user-permissions-overview")}
      >
        <p>
          본 서비스는 계정마다 <strong>역할(Role)</strong>을 부여하여 메뉴와
          기능 접근을 제한합니다. 아래 네 가지 역할이 있으며, 다음 절에서
          기능별 상세 비교표를 확인할 수 있습니다.
        </p>
        <ul className="list-inside list-disc space-y-2 text-muted-foreground">
          <li>
            <strong>{ROLE_LABELS.ADMIN}:</strong> 전체 시스템 관리 — 시설
            JSON 업로드, 사용자·데이터셋 관리, 모든 점검·설정 기능
          </li>
          <li>
            <strong>{ROLE_LABELS.MANAGER}:</strong> 시설·점검 전 과정 — 현장
            점검 작성·완료·안전관리자 서명, 설정(서명 정책) 접근 (위탁
            서명 제외)
          </li>
          <li>
            <strong>{ROLE_LABELS.INSPECTOR}:</strong> 현장 점검·위탁 서명 —
            점검 작성·완료·위탁점검자 서명 (설정 화면 제외)
          </li>
          <li>
            <strong>{ROLE_LABELS.VIEWER}:</strong> 조회·대장·자기 정보 — 시설·
            점검 이력·대장 조회, 본인 계정 정보 수정
          </li>
        </ul>
        <ManualCallout variant="info">
          일반적으로 기관 운영 담당에는 <strong>안전관리자</strong> 역할을
          추천합니다. 역할 명칭과 세부 범위는 조직 정책에 따라 달라질 수
          있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="user-permissions-matrix"
        title="14. 역할별 기능 비교"
        description="시설·점검·계정·설정 기능을 역할별로 비교합니다"
        hidden={isHidden(hiddenSectionIds, "user-permissions-matrix")}
      >
        <p>
          아래 표에서 역할별로 사용 가능한 기능을 한눈에 비교할 수 있습니다.{" "}
          <Check className="inline size-3.5 text-success" aria-hidden />
          는 가능, 회색 — 는 불가를 의미합니다.
        </p>
        <RolePermissionMatrix showFooter={false} />
      </ManualSection>

      <ManualSection
        id="user-permissions-policy"
        title="15. 권한 제한 및 정책"
        hidden={isHidden(hiddenSectionIds, "user-permissions-policy")}
      >
        <p>역할별로 특히 자주 헷갈리는 제한 사항과 계정 부여 정책입니다.</p>
        <RolePermissionPolicyNotes />
        <RolePermissionMatrixLegend />
      </ManualSection>

      <ManualSection
        id="user-management"
        title="16. 사용자 계정 관리"
        description="시스템 관리자 전용"
        hidden={isHidden(hiddenSectionIds, "user-management")}
      >
        <p>
          <strong>시스템 관리자</strong>는 사이드바 「설정」&gt;「사용자
          관리」에서 계정을 생성·변경합니다.
        </p>
        <ul className="list-inside list-disc space-y-1 text-muted-foreground">
          <li>신규 계정 생성(이메일·초기 비밀번호·역할)</li>
          <li>역할 변경 — 신규 계정에는 시스템 관리자를 제외한 역할만 부여</li>
          <li>일시 정지·해제 및 정지 사유 기록</li>
          <li>데이터셋(시설정보 사용자화) 할당 — 사용자별 조회·점검 범위</li>
        </ul>
        <ManualCallout variant="info">
          역할별 기능 비교는 매뉴얼 「역할별 기능 비교」 절을 참고하세요.
          사용자 관리 화면에서는 계정 운영에 집중할 수 있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="data-export"
        title="17. 데이터보내기"
        hidden={isHidden(hiddenSectionIds, "data-export")}
      >
        <p>
          Excel·CSV 등으로 점검·시설 데이터를보내는 기능이 제공될 수
          있습니다. 기간·시설·점검 상태 조건을 지정해 추출합니다.
        </p>
        <ManualCallout variant="info">
         보내기 메뉴 유무와 파일 형식은 서비스 버전 및 관리자 설정에
          따라 달라질 수 있습니다.
        </ManualCallout>
      </ManualSection>

      <ManualSection
        id="faq"
        title="18. 자주 묻는 질문"
        hidden={isHidden(hiddenSectionIds, "faq")}
      >
        <ManualFAQ items={manualFaqItems} />
      </ManualSection>

      <ManualSection
        id="troubleshooting"
        title="19. 문제 해결"
        hidden={isHidden(hiddenSectionIds, "troubleshooting")}
      >
        <div className="space-y-4">
          <div>
            <h3 className="font-medium">로그인이 안 되는 경우</h3>
            <p className="mt-1 text-muted-foreground">
              이메일·비밀번호를 확인하고, 계정 정지 여부는 관리자에게
              문의하세요. 쿠키·시크릿 모드 설정도 확인해 보세요.
            </p>
          </div>
          <div>
            <h3 className="font-medium">사진 업로드가 안 되는 경우</h3>
            <p className="mt-1 text-muted-foreground">
              점검 항목별 사진 첨부는 현재 「기능 추가 예정」 상태입니다.
              화면에 업로드 UI가 없다면 정상이며, 기능 공개 이후에도 문제가
              지속되면 파일 용량·형식과 네트워크 연결을 확인하세요.
            </p>
          </div>
          <div>
            <h3 className="font-medium">PDF 다운로드가 안 되는 경우</h3>
            <p className="mt-1 text-muted-foreground">
              팝업 차단을 해제하고, 다른 브라우저로 시도해 보세요. 점검 저장이
              완료되었는지 확인하세요.
            </p>
          </div>
          <div>
            <h3 className="font-medium">점검 저장이 안 되는 경우</h3>
            <p className="mt-1 text-muted-foreground">
              필수 항목 입력 여부를 확인하고, 세션 만료 시 다시 로그인한 뒤
              재시도하세요.
            </p>
          </div>
          <div>
            <h3 className="font-medium">데이터가 보이지 않는 경우</h3>
            <p className="mt-1 text-muted-foreground">
              할당된 데이터셋·역할 권한을 확인하세요. 관리자에게 데이터셋
              할당을 요청할 수 있습니다.
            </p>
          </div>
        </div>
      </ManualSection>

      <ManualSection
        id="changelog"
        title="20. 업데이트 이력"
        hidden={isHidden(hiddenSectionIds, "changelog")}
      >
        <ManualUpdateHistory entries={manualUpdateHistory} />
      </ManualSection>
    </div>
  )
}
