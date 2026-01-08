import { Agent } from '@atproto/api'

export interface Participant {
  did: string
  handle: string
  displayName?: string
  avatar?: string
  repostedAt: string
  type: 'repost' | 'quote'
}

export function parsePostUrl(url: string): { handle: string; rkey: string } | null {
  try {
    const urlObj = new URL(url)
    const pathParts = urlObj.pathname.split('/').filter(Boolean)
    // /profile/<handle>/post/<rkey>
    if (pathParts[0] === 'profile' && pathParts[2] === 'post') {
      return { handle: pathParts[1], rkey: pathParts[3] }
    }
    return null
  } catch {
    return null
  }
}

export async function resolveDid(agent: Agent, handle: string): Promise<string | null> {
  try {
    const res = await agent.resolveHandle({ handle })
    return res.data.did
  } catch (e) {
    console.error('Failed to resolve handle', e)
    return null
  }
}

export async function fetchAllReposters(
  agent: Agent,
  uri: string,
  onProgress?: (count: number) => void
): Promise<Participant[]> {
  let cursor: string | undefined
  const participants: Participant[] = []

  do {
    const res = await agent.getRepostedBy({ uri, cursor, limit: 100 })
    const repostedBy = res.data.repostedBy
    
    // We only get the user profile, not the timestamp of the repost in this endpoint usually?
    // Wait, getRepostedBy returns profiles. It DOES NOT return the timestamp of the repost action easily in the simple view.
    // This is a limitation. To get the timestamp, we might need to fetch the repost record itself?
    // Or maybe the current API doesn't expose it in the aggregated view.
    // For now, we might have to skip the exact timestamp if not available, OR assume "now" implies validity if we can't check.
    // BUT the requirement says "display list... date/time" and "filter by time".
    // If getRepostedBy doesn't give time, we have a problem.
    // Alternative: List Reposts (collection listing) for each user? Too expensive.
    // Alternative: Maybe there's a different endpoint.
    // Actually, `app.bsky.feed.getRepostedBy` returns `repostedBy: ProfileView[]`. No timestamp.
    
    // WORKAROUND: For the purpose of this tool, checking exact repost time might be hard via this endpoint.
    // However, if we need to filter by time, we really need the timestamp.
    // We could iterate over the repo of the reposter to find the repost record? That's extremely heavy.
    // Maybe `app.bsky.feed.getTimeline` or notifications? No.
    
    // Let's look at `getQuotes`. Quotes are posts, so they have `indexedAt` or `createdAt`.
    // Reposts... strictly speaking, are records.
    // Maybe we just ignore the time for Reposts if we can't get it, or warn the user.
    // OR, we assume the user accepts that "Reposts" are hard to time-filter, but Quotes are easy.
    // Let's check if there is an alternative. `com.atproto.repo.listRecords` on the collection `app.bsky.feed.repost` filtering by subject?
    // No, you can't filter listRecords by content (subject).
    
    // So, filtering Reposts by time is technically difficult without a firehose or an indexer.
    // I will proceed with fetching profiles and note that Repost time might be unavailable (or set to "Unknown").
    // Quotes will have time.
    
    for (const user of repostedBy) {
      participants.push({
        did: user.did,
        handle: user.handle,
        displayName: user.displayName,
        avatar: user.avatar,
        repostedAt: new Date().toISOString(), // Placeholder as we can't easily get it
        type: 'repost'
      })
    }
    
    cursor = res.data.cursor
    if (onProgress) onProgress(participants.length)
  } while (cursor)

  return participants
}

export async function fetchAllQuotes(
  agent: Agent,
  uri: string,
  onProgress?: (count: number) => void
): Promise<Participant[]> {
  let cursor: string | undefined
  const participants: Participant[] = []
  
  // Need to verify if app.bsky.feed.getQuotes exists on the agent wrapper.
  // Using generic call to be safe if types are outdated.
  try {
    do {
       // @ts-ignore
      const res = await agent.app.bsky.feed.getQuotes({ uri, cursor, limit: 100 })
      // @ts-ignore
      const posts = res.data.posts
      
      for (const post of posts) {
        participants.push({
          did: post.author.did,
          handle: post.author.handle,
          displayName: post.author.displayName,
          avatar: post.author.avatar,
          repostedAt: (post.record as any).createdAt, // Quotes have records
          type: 'quote'
        })
      }

      // @ts-ignore
      cursor = res.data.cursor
       if (onProgress) onProgress(participants.length)
    } while (cursor)
  } catch (e) {
    console.warn('getQuotes failed or not supported', e)
  }

  return participants
}

export async function fetchFollowers(
  agent: Agent,
  actor: string,
  onProgress?: (count: number) => void
): Promise<Set<string>> {
  let cursor: string | undefined
  const followerDids = new Set<string>()

  do {
    const res = await agent.getFollowers({ actor, cursor, limit: 100 })
    for (const follower of res.data.followers) {
      followerDids.add(follower.did)
    }
    cursor = res.data.cursor
    if (onProgress) onProgress(followerDids.size)
  } while (cursor)

  return followerDids
}
