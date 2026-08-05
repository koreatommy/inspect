"use client"

import { ImagePlus, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE } from "@/lib/ai/schema"

interface ImageUploadProps {
  file: File | null
  onFileChange: (file: File | null) => void
  disabled?: boolean
}

export function ImageUpload({ file, onFileChange, disabled }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  const validateAndSetFile = useCallback(
    (f: File | null) => {
      setError(null)

      if (!f) {
        setPreview(null)
        onFileChange(null)
        return
      }

      if (!ALLOWED_IMAGE_TYPES.includes(f.type)) {
        setError("JPG, PNG, WEBP 형식의 이미지만 업로드할 수 있습니다.")
        return
      }

      if (f.size > MAX_IMAGE_SIZE) {
        setError("이미지는 최대 20MB까지 업로드할 수 있습니다.")
        return
      }

      const url = URL.createObjectURL(f)
      setPreview(url)
      onFileChange(f)
    },
    [onFileChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      setDragActive(false)
      if (disabled) return

      const droppedFile = e.dataTransfer.files[0]
      if (droppedFile) {
        validateAndSetFile(droppedFile)
      }
    },
    [disabled, validateAndSetFile]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setDragActive(false)
  }, [])

  const handleFileSelect = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFile = e.target.files?.[0]
      if (selectedFile) {
        validateAndSetFile(selectedFile)
      }
    },
    [validateAndSetFile]
  )

  const handleRemove = useCallback(() => {
    if (preview) {
      URL.revokeObjectURL(preview)
    }
    setPreview(null)
    onFileChange(null)
    if (inputRef.current) {
      inputRef.current.value = ""
    }
  }, [preview, onFileChange])

  return (
    <div className="space-y-3">
      <input
        ref={inputRef}
        type="file"
        accept={ALLOWED_IMAGE_TYPES.join(",")}
        onChange={handleFileSelect}
        className="hidden"
        disabled={disabled}
      />

      {!preview ? (
        <div
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onClick={() => !disabled && inputRef.current?.click()}
          className={cn(
            "flex min-h-[200px] cursor-pointer flex-col items-center justify-center gap-3 rounded-lg border-2 border-dashed p-6 transition-colors",
            dragActive
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50",
            disabled && "cursor-not-allowed opacity-50"
          )}
        >
          <ImagePlus className="size-10 text-muted-foreground" />
          <div className="text-center">
            <p className="font-medium">
              이미지를 드래그하거나 클릭하여 선택
            </p>
            <p className="mt-1 text-sm text-muted-foreground">
              JPG, PNG, WEBP (최대 20MB)
            </p>
          </div>
        </div>
      ) : (
        <div className="relative overflow-hidden rounded-lg border">
          <img
            src={preview}
            alt="업로드된 이미지 미리보기"
            className="max-h-[400px] w-full object-contain"
          />
          {!disabled && (
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              className="absolute right-2 top-2"
              onClick={handleRemove}
            >
              <X className="size-4" />
              <span className="sr-only">이미지 제거</span>
            </Button>
          )}
        </div>
      )}

      {error && <p className="text-sm text-destructive">{error}</p>}
    </div>
  )
}
