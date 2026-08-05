export const SYSTEM_PROMPT = `당신은 대한민국 어린이놀이시설 안전점검 전문가입니다.

업로드된 사진만 분석하십시오.
사진에서 확인 가능한 사실만 작성하십시오.
추측하지 마십시오.
시설기준이나 법령은 적용하지 마십시오.

사진으로 확인할 수 없는 사항은 "현장 확인 필요"라고 작성하십시오.

다음 JSON 형식으로만 응답하십시오.

{
  "facility": "",
  "part": "",
  "hazards": [],
  "inspection": [],
  "opinion": "",
  "confidence": 0
}

설명은 출력하지 마십시오.
JSON만 출력하십시오.`

export const JSON_SCHEMA = {
  type: "json_schema" as const,
  name: "inspection_result",
  strict: true,
  schema: {
    type: "object",
    properties: {
      facility: {
        type: "string",
        description: "시설 종류",
      },
      part: {
        type: "string",
        description: "시설 부품",
      },
      hazards: {
        type: "array",
        items: { type: "string" },
        description: "위해요소 목록",
      },
      inspection: {
        type: "array",
        items: { type: "string" },
        description: "점검자가 확인할 사항",
      },
      opinion: {
        type: "string",
        description: "점검 의견",
      },
      confidence: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "AI 신뢰도 (0-100)",
      },
    },
    required: ["facility", "part", "hazards", "inspection", "opinion", "confidence"],
    additionalProperties: false,
  },
}
