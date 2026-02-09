const REDDIT_TOKEN_URL = 'https://www.reddit.com/api/v1/access_token'
const REDDIT_API_BASE = 'https://oauth.reddit.com'

// Relevant subreddits for equipment vendors/dealers
const EQUIPMENT_SUBREDDITS = [
  'heavyequipment',
  'Construction',
  'equipmenttrading',
  'HeavyEquipmentTrading',
  'constructionequipment',
  'Excavators',
  'heavymachinery',
]

let cachedToken: { token: string; expiresAt: number } | null = null

async function getAccessToken(): Promise<string> {
  // Return cached token if still valid (with 60s buffer)
  if (cachedToken && cachedToken.expiresAt > Date.now() + 60000) {
    return cachedToken.token
  }

  const clientId = process.env.REDDIT_CLIENT_ID
  const clientSecret = process.env.REDDIT_CLIENT_SECRET

  if (!clientId || !clientSecret) {
    throw new Error('Missing Reddit API credentials')
  }

  const auth = Buffer.from(`${clientId}:${clientSecret}`).toString('base64')

  const response = await fetch(REDDIT_TOKEN_URL, {
    method: 'POST',
    headers: {
      Authorization: `Basic ${auth}`,
      'Content-Type': 'application/x-www-form-urlencoded',
      'User-Agent': 'VendorMarketingSystem/1.0',
    },
    body: 'grant_type=client_credentials',
  })

  if (!response.ok) {
    throw new Error(`Reddit auth failed: ${response.status}`)
  }

  const data = await response.json()
  cachedToken = {
    token: data.access_token,
    expiresAt: Date.now() + data.expires_in * 1000,
  }

  return cachedToken.token
}

export interface RedditPost {
  id: string
  title: string
  selftext: string
  subreddit: string
  author: string
  url: string
  permalink: string
  score: number
  num_comments: number
  created_utc: number
  link_flair_text: string | null
}

export interface RedditSearchResult {
  posts: RedditPost[]
  subredditsSearched: string[]
  totalResults: number
}

export async function searchReddit(
  query: string,
  options?: {
    subreddits?: string[]
    sort?: 'relevance' | 'hot' | 'top' | 'new'
    time?: 'hour' | 'day' | 'week' | 'month' | 'year' | 'all'
    limit?: number
  }
): Promise<RedditSearchResult> {
  const token = await getAccessToken()
  const subreddits = options?.subreddits || EQUIPMENT_SUBREDDITS
  const sort = options?.sort || 'relevance'
  const time = options?.time || 'year'
  const limit = options?.limit || 10

  const allPosts: RedditPost[] = []

  // Search across multiple subreddits
  const subredditString = subreddits.join('+')
  const searchUrl = `${REDDIT_API_BASE}/r/${subredditString}/search?q=${encodeURIComponent(query)}&sort=${sort}&t=${time}&limit=${limit}&restrict_sr=on&type=link`

  const response = await fetch(searchUrl, {
    headers: {
      Authorization: `Bearer ${token}`,
      'User-Agent': 'VendorMarketingSystem/1.0',
    },
  })

  if (response.ok) {
    const data = await response.json()
    const posts = data?.data?.children || []

    for (const child of posts) {
      const post = child.data
      allPosts.push({
        id: post.id,
        title: post.title,
        selftext: post.selftext?.slice(0, 500) || '',
        subreddit: post.subreddit,
        author: post.author,
        url: post.url,
        permalink: `https://reddit.com${post.permalink}`,
        score: post.score,
        num_comments: post.num_comments,
        created_utc: post.created_utc,
        link_flair_text: post.link_flair_text,
      })
    }
  }

  // Also search the general Reddit if subreddit-restricted search yields few results
  if (allPosts.length < 3) {
    const generalUrl = `${REDDIT_API_BASE}/search?q=${encodeURIComponent(query + ' equipment dealer')}&sort=${sort}&t=${time}&limit=${limit}&type=link`

    const generalResponse = await fetch(generalUrl, {
      headers: {
        Authorization: `Bearer ${token}`,
        'User-Agent': 'VendorMarketingSystem/1.0',
      },
    })

    if (generalResponse.ok) {
      const data = await generalResponse.json()
      const posts = data?.data?.children || []

      for (const child of posts) {
        const post = child.data
        // Avoid duplicates
        if (!allPosts.find((p) => p.id === post.id)) {
          allPosts.push({
            id: post.id,
            title: post.title,
            selftext: post.selftext?.slice(0, 500) || '',
            subreddit: post.subreddit,
            author: post.author,
            url: post.url,
            permalink: `https://reddit.com${post.permalink}`,
            score: post.score,
            num_comments: post.num_comments,
            created_utc: post.created_utc,
            link_flair_text: post.link_flair_text,
          })
        }
      }
    }
  }

  // Sort by score (engagement)
  allPosts.sort((a, b) => b.score - a.score)

  return {
    posts: allPosts,
    subredditsSearched: subreddits,
    totalResults: allPosts.length,
  }
}
