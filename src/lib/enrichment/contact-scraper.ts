// Website scraper to extract contact emails and owner names
// from vendor websites found via Google Places.
// Falls back to contact form URL when no email is found.
// Includes concurrency throttling to avoid IP blocks.

const TIMEOUT_MS = 5000
const MAX_CONCURRENT_SCRAPES = 3 // Max simultaneous website fetches

// Email prefixes that are generic (not a specific person)
const GENERIC_EMAIL_PREFIXES = [
  'info', 'support', 'help', 'noreply', 'no-reply', 'admin',
  'webmaster', 'postmaster', 'mailer-daemon', 'abuse',
  'privacy', 'legal', 'billing', 'hello', 'contact',
]

// Titles that indicate a decision maker
const OWNER_TITLES = [
  'owner', 'president', 'ceo', 'founder', 'principal',
  'general manager', 'gm', 'dealer principal', 'managing director',
  'vice president', 'vp', 'director', 'partner',
]

export interface ContactInfo {
  email: string
  contactName: string
  contactFormUrl: string
  offersFinancing: boolean | null
}

// Detect if a dealer's website mentions financing/credit services
const FINANCING_KEYWORDS = [
  'financing available', 'finance application', 'apply for credit',
  'apply for financing', 'payment calculator', 'monthly payments',
  'lease options', 'credit application', 'financing options',
  'finance your', 'get pre-approved', 'pre-qualification',
  'equipment financing', 'loan application', 'finance department',
]

function detectFinancingOnWebsite(html: string): boolean {
  const lower = html.toLowerCase()
  return FINANCING_KEYWORDS.some((keyword) => lower.includes(keyword))
}

async function fetchWithTimeout(url: string, timeout: number): Promise<string> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeout)

  try {
    const response = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml',
      },
      redirect: 'follow',
    })

    if (!response.ok) throw new Error(`HTTP ${response.status}`)

    // Only read first 200KB to avoid huge pages
    const reader = response.body?.getReader()
    if (!reader) throw new Error('No response body')

    const chunks: Uint8Array[] = []
    let totalSize = 0
    const maxSize = 200 * 1024

    while (totalSize < maxSize) {
      const { done, value } = await reader.read()
      if (done) break
      chunks.push(value)
      totalSize += value.length
    }

    reader.cancel()
    const decoder = new TextDecoder()
    return chunks.map((c) => decoder.decode(c, { stream: true })).join('')
  } finally {
    clearTimeout(timer)
  }
}

function extractEmails(html: string): string[] {
  const emailRegex = /[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g
  const matches = html.match(emailRegex) || []

  return Array.from(new Set(matches)).filter((email) => {
    const lower = email.toLowerCase()
    if (/\.(png|jpg|jpeg|gif|svg|webp|css|js)$/i.test(lower)) return false
    if (email.length > 60) return false
    if (lower.includes('sentry') || lower.includes('wixpress')) return false
    return true
  })
}

function isPersonalEmail(email: string): boolean {
  const prefix = email.split('@')[0].toLowerCase()
  return !GENERIC_EMAIL_PREFIXES.includes(prefix)
}

function pickBestEmail(emails: string[]): string {
  if (emails.length === 0) return ''
  const personal = emails.find((e) => isPersonalEmail(e))
  return personal || emails[0]
}

function findContactPageUrls(html: string, baseUrl: string): string[] {
  const urls: string[] = []
  const linkRegex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const lower = href.toLowerCase()

    if (
      lower.includes('contact') ||
      lower.includes('about') ||
      lower.includes('team') ||
      lower.includes('staff') ||
      lower.includes('leadership')
    ) {
      try {
        const fullUrl = new URL(href, baseUrl).toString()
        if (new URL(fullUrl).hostname === new URL(baseUrl).hostname) {
          urls.push(fullUrl)
        }
      } catch {
        // Invalid URL, skip
      }
    }
  }

  return Array.from(new Set(urls))
}

// Find a contact form URL (page with a <form> that has contact-related fields)
function findContactFormUrl(html: string, baseUrl: string): string {
  // First check: does the current page have a contact form?
  const hasForm = /<form[^>]*>/i.test(html)
  const hasContactField =
    /name=["'](?:email|name|message|phone|subject|inquiry)/i.test(html) ||
    /type=["'](?:email)/i.test(html) ||
    /placeholder=["'][^"']*(?:email|name|message|your name)/i.test(html)

  if (hasForm && hasContactField) {
    return baseUrl
  }

  // Otherwise, look for links to a contact page
  const linkRegex = /<a[^>]+href=["']([^"'#]+)["'][^>]*>([^<]*)<\/a>/gi
  let match

  while ((match = linkRegex.exec(html)) !== null) {
    const href = match[1]
    const text = match[2].toLowerCase()
    const lower = href.toLowerCase()

    // Match links whose text or URL says "contact"
    if (
      lower.includes('contact') ||
      text.includes('contact') ||
      text.includes('get in touch') ||
      text.includes('reach us')
    ) {
      try {
        const fullUrl = new URL(href, baseUrl).toString()
        if (new URL(fullUrl).hostname === new URL(baseUrl).hostname) {
          return fullUrl
        }
      } catch {
        // Invalid URL
      }
    }
  }

  return ''
}

function extractContactName(html: string): string {
  const text = html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ')
  const titlePattern = OWNER_TITLES.join('|')

  const patterns = [
    // "John Smith, Owner" or "John Smith - President"
    new RegExp(
      `([A-Z][a-z]{1,15}\\s+[A-Z][a-z]{1,20})\\s*[,\\-–|]\\s*(?:${titlePattern})`,
      'i'
    ),
    // "Owner: John Smith" or "President - John Smith"
    new RegExp(
      `(?:${titlePattern})\\s*[:\\-–|]\\s*([A-Z][a-z]{1,15}\\s+[A-Z][a-z]{1,20})`,
      'i'
    ),
  ]

  for (const pattern of patterns) {
    const match = text.match(pattern)
    if (match && match[1]) {
      return match[1].trim()
    }
  }

  return ''
}

export async function scrapeContactInfo(
  websiteUrl: string
): Promise<ContactInfo> {
  try {
    const url = websiteUrl.startsWith('http')
      ? websiteUrl
      : `https://${websiteUrl}`

    const html = await fetchWithTimeout(url, TIMEOUT_MS)

    let emails = extractEmails(html)
    let contactName = extractContactName(html)
    let contactFormUrl = ''
    const offersFinancing = detectFinancingOnWebsite(html)

    // If no personal email found, try contact/about pages
    if (!emails.some(isPersonalEmail)) {
      const subpageUrls = findContactPageUrls(html, url)

      for (const pageUrl of subpageUrls.slice(0, 2)) {
        try {
          const pageHtml = await fetchWithTimeout(pageUrl, TIMEOUT_MS)
          const pageEmails = extractEmails(pageHtml)
          emails = [...emails, ...pageEmails]

          if (!contactName) {
            contactName = extractContactName(pageHtml)
          }

          // Check subpage for contact form too
          if (!contactFormUrl) {
            contactFormUrl = findContactFormUrl(pageHtml, pageUrl)
          }

          if (emails.some(isPersonalEmail)) break
        } catch {
          // Skip failed subpages
        }
      }
    }

    // Fallback: if still no email, find a contact form URL
    if (emails.length === 0 && !contactFormUrl) {
      contactFormUrl = findContactFormUrl(html, url)
    }

    emails = Array.from(new Set(emails))

    return {
      email: pickBestEmail(emails),
      contactName,
      contactFormUrl: emails.length === 0 ? contactFormUrl : '',
      offersFinancing,
    }
  } catch {
    return { email: '', contactName: '', contactFormUrl: '', offersFinancing: null }
  }
}

// Throttled concurrency limiter — runs async tasks in batches
async function throttle<T>(
  tasks: (() => Promise<T>)[],
  maxConcurrent: number
): Promise<T[]> {
  const results: T[] = []

  for (let i = 0; i < tasks.length; i += maxConcurrent) {
    const batch = tasks.slice(i, i + maxConcurrent)
    const batchResults = await Promise.all(batch.map((fn) => fn()))
    results.push(...batchResults)
  }

  return results
}

// Enrich an array of vendors with scraped contact info
// Throttled to MAX_CONCURRENT_SCRAPES simultaneous fetches
export async function enrichVendorsWithContactInfo<
  T extends {
    website: string
    email: string
    contact_name: string
    contact_form_url?: string
    offers_financing_on_website?: boolean | null
  },
>(vendors: T[]): Promise<T[]> {
  const tasks = vendors.map((vendor) => async () => {
    if (!vendor.website) return vendor

    try {
      const contactInfo = await scrapeContactInfo(vendor.website)

      return {
        ...vendor,
        email: contactInfo.email || vendor.email,
        contact_name: contactInfo.contactName || vendor.contact_name,
        contact_form_url: contactInfo.contactFormUrl || '',
        offers_financing_on_website: contactInfo.offersFinancing,
      }
    } catch {
      return vendor
    }
  })

  return throttle(tasks, MAX_CONCURRENT_SCRAPES)
}
