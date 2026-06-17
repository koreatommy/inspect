declare module "html2pdf.js" {
  interface Html2PdfOptions {
    margin?: number | number[]
    filename?: string
    image?: { type?: string; quality?: number }
    html2canvas?: {
      scale?: number
      useCORS?: boolean
      letterRendering?: boolean
      logging?: boolean
      onclone?: (clonedDoc: Document) => void
      backgroundColor?: string | null
      ignoreElements?: (element: Element) => boolean
    }
    jsPDF?: {
      unit?: string
      format?: string | number[]
      orientation?: "portrait" | "landscape"
    }
    pagebreak?: {
      mode?: string | string[]
      avoid?: string[]
      before?: string[]
      after?: string[]
    }
    enableLinks?: boolean
    output?: string
  }

  interface Html2PdfInstance {
    set(opt: Html2PdfOptions): Html2PdfInstance
    from(element: Element | HTMLElement | null): Html2PdfInstance
    save(): Promise<void>
    output(type: string, options?: unknown): Promise<unknown>
  }

  function html2pdf(): Html2PdfInstance

  export default html2pdf
}
