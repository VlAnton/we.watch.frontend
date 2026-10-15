export function parseSvg(svgRawString: string): SVGElement {
  const parser = new DOMParser()
  const doc = parser.parseFromString(svgRawString, 'image/svg+xml')
  const svgEl = doc.documentElement

  const parserError = doc.querySelector('parsererror')
  if (parserError || !svgEl || svgEl.nodeName.toLowerCase() !== 'svg') {
    throw new Error('Ошибка парсинга SVG-файла')
  }

  return svgEl as unknown as SVGElement
}
