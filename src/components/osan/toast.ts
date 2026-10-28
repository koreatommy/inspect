import { toast as sonner } from "sonner"

const opts = { position: "bottom-center" as const }

export const toast = {
  success: (message: string) => sonner.success(message, opts),
  error: (message: string) => sonner.error(message, opts),
}
