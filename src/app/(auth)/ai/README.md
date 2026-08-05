# AI Playground Inspector MVP

어린이놀이시설 사진을 OpenAI GPT-5 Vision으로 분석하여 위해요소를 자동 추출하는 MVP 페이지입니다.

## 현재 상태: MVP (테스트)

- **경로**: `/ai` (비로그인 공개 페이지)
- **목적**: OpenAI Vision API의 성능 검증
- **제한**: DB 저장, PDF 생성, 시설기준 판정 미포함

## 사용 방법

1. OpenAI API 키 입력 (키는 서버에 저장되지 않음)
2. 어린이놀이시설 사진 업로드 (JPG, PNG, WEBP / 최대 20MB)
3. "AI 분석하기" 클릭
4. 결과 확인 및 필요시 수정

## 분석 결과

- 시설 종류
- 시설 부품
- 위해요소 목록
- 점검자가 확인할 사항
- 점검 의견
- AI 신뢰도 (0-100%)

모든 결과는 사용자가 직접 수정할 수 있습니다.

## 기술 스택

- Next.js 16 + TypeScript
- OpenAI Responses API (`gpt-5-mini`)
- JSON Schema 기반 구조화된 응답
- shadcn/ui 컴포넌트

## 로드맵

| 단계 | 상태 | 설명 |
|------|------|------|
| **MVP** | ✅ 현재 | 비로그인 `/ai`에서 성능 검증 |
| **정식 통합** | 🔜 예정 | `(dashboard)` 하위로 이전, 사이드바 메뉴 연결, 권한·API 키 관리 방식 재검토 |

## 파일 구조

```
src/
├── app/(auth)/ai/
│   ├── page.tsx          # 페이지 셸
│   ├── error.tsx         # 에러 UI
│   └── README.md         # 이 문서
├── app/api/ai/
│   └── analyze/route.ts  # POST API
├── components/ai/
│   ├── ai-inspector-page.tsx  # 메인 컴포넌트
│   ├── api-key-input.tsx      # API 키 입력
│   ├── image-upload.tsx       # 이미지 업로드
│   └── result-form.tsx        # 결과 폼
└── lib/ai/
    ├── schema.ts         # Zod 스키마
    ├── prompt.ts         # 프롬프트·JSON Schema
    └── analyze.ts        # OpenAI 호출
```

## 보안 고려사항

- API 키는 요청 시에만 서버로 전달되며 저장되지 않음
- 이미지는 메모리에서 처리 후 즉시 폐기
- 브라우저 `sessionStorage`에만 키 임시 보관 (탭 닫으면 삭제)
