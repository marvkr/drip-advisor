export function parseOutfitTag(text: string): { clean: string; ids: string[] } {
  const match = text.match(/\[OUTFIT:([^\]]+)\]\s*$/)
  if (!match) return { clean: text, ids: [] }
  const ids = match[1].split(',').map((s) => s.trim()).filter(Boolean)
  const clean = text.slice(0, match.index).trimEnd()
  return { clean, ids }
}
