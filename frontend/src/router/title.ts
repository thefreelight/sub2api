const DEFAULT_SITE_NAME = 'NavtoAI API'
type TranslateTitle = (key: string) => string

function normalizeSiteName(siteName?: string): string {
  const trimmed = typeof siteName === 'string' ? siteName.trim() : ''
  if (!trimmed || trimmed === 'Sub2API') {
    return DEFAULT_SITE_NAME
  }
  return trimmed.toLowerCase() === 'navtoai api' ? DEFAULT_SITE_NAME : trimmed
}

/**
 * 统一生成页面标题，避免多处写入 document.title 产生覆盖冲突。
 * 优先使用 titleKey 通过 i18n 翻译，fallback 到静态 routeTitle。
 */
export function resolveDocumentTitle(
  routeTitle: unknown,
  siteName?: string,
  titleKey?: string,
  translate?: TranslateTitle
): string {
  const normalizedSiteName = normalizeSiteName(siteName)

  if (typeof titleKey === 'string' && titleKey.trim()) {
    const translated = translate?.(titleKey)
    if (translated && translated !== titleKey) {
      return `${translated} - ${normalizedSiteName}`
    }
  }

  if (typeof routeTitle === 'string' && routeTitle.trim()) {
    return `${routeTitle.trim()} - ${normalizedSiteName}`
  }

  return normalizedSiteName
}
