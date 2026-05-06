"use client"

import { useRef, useState } from "react"
import SignatureCanvas from "react-signature-canvas"

import { Button } from "@/components/ui/button"

export function SignaturePad({
  name,
  label,
}: {
  name: string
  label: string
}) {
  const ref = useRef<SignatureCanvas>(null)
  const [dataUrl, setDataUrl] = useState("")

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => {
            ref.current?.clear()
            setDataUrl("")
          }}
        >
          서명 초기화
        </Button>
      </div>
      <div className="rounded-lg border bg-white p-2 dark:bg-gray-50">
        <SignatureCanvas
          ref={ref}
          clearOnResize={false}
          penColor="#0a0a0a"
          minWidth={1.25}
          maxWidth={3}
          velocityFilterWeight={0.85}
          canvasProps={{
            className: "h-32 w-full rounded-md touch-none",
          }}
          onEnd={() => {
            const canvas = ref.current
            if (!canvas || canvas.isEmpty()) {
              setDataUrl("")
              return
            }
            setDataUrl(canvas.getTrimmedCanvas().toDataURL("image/png"))
          }}
        />
      </div>
      <input type="hidden" name={name} value={dataUrl} />
    </div>
  )
}
