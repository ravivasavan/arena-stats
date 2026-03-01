const BASE = '/api/arena/v3'

function headers(token) {
  return {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  }
}

async function request(path, token) {
  const res = await fetch(`${BASE}${path}`, { headers: headers(token) })
  if (!res.ok) {
    if (res.status === 429) {
      throw new Error('Rate limited by Are.na. Please wait a minute and try again.')
    }
    if (res.status === 401) {
      throw new Error('Invalid token. Please check your Are.na access token.')
    }
    throw new Error(`Are.na API error (${res.status})`)
  }
  return res.json()
}

export async function fetchMe(token) {
  return request('/me', token)
}

export async function fetchAllChannels(userSlug, token) {
  const first = await request(
    `/users/${userSlug}/contents?type=Channel&per=100&page=1`,
    token,
  )

  const channels = [...first.data]
  const totalPages = first.meta.total_pages

  if (totalPages > 1) {
    const remaining = []
    for (let page = 2; page <= totalPages; page++) {
      remaining.push(
        request(
          `/users/${userSlug}/contents?type=Channel&per=100&page=${page}`,
          token,
        ),
      )
    }
    const pages = await Promise.all(remaining)
    for (const page of pages) {
      channels.push(...page.data)
    }
  }

  return channels
}

export async function fetchBlockCount(userSlug, token) {
  const res = await request(
    `/users/${userSlug}/contents?type=Block&per=1&page=1`,
    token,
  )
  return res.meta.total_count
}
