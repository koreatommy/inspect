export function scrollToId(id: string, offset = 0) {
  const el = document.getElementById(id)
  if (!el) return

  const y = el.getBoundingClientRect().top + window.scrollY - offset
  window.scrollTo({ top: y, behavior: "smooth" })
}

export function scrollToTop() {
  window.scrollTo({ top: 0, behavior: "smooth" })
}
