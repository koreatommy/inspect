import type { ReactNode } from "react"

export function PrintLayout({ children }: { children: ReactNode }) {
  return (
    <section className="ledger-print-root mx-auto w-full max-w-[210mm] rounded-2xl bg-white p-6 text-zinc-950 shadow-sm print:mx-0 print:max-w-none print:w-full print:rounded-none print:p-0 print:shadow-none dark:text-zinc-950">
      {children}
    </section>
  )
}
