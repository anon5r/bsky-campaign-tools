import {BskyAgent} from '@atproto/api';

async function main() {
  const handle = process.argv[2] || 'anon5r.com';
  console.log(`Starting follower verification for: ${handle}`);

  const agent = new BskyAgent({
    service: 'https://public.api.bsky.app',
  });

  // Note: For public data, we might not need to log in if the API is open,
  // but getFollowers often requires auth or has better rate limits.
  // We will try without auth first, but usually getFollowers works for public profiles.
  // If rate limited, we might need auth.
  // For this CLI, we'll try anonymously or ask for credentials if needed.
  // Actually, getFollowers is public.

  try {
    const resolution = await agent.resolveHandle({handle});
    const did = resolution.data.did;
    console.log(`Resolved DID: ${did}`);

    const profile = await agent.getProfile({actor: did});
    console.log(`Profile Follower Count: ${profile.data.followersCount}`);

    console.log('Fetching followers via API (this may take time)...');

    let cursor: string | undefined;
    const followers: any[] = [];
    let page = 1;

    do {
      const res = await agent.app.bsky.graph.getFollowers({
        actor: did,
        limit: 100,
        cursor,
      });

      const pageFollowers = res.data.followers;
      followers.push(...pageFollowers);
      cursor = res.data.cursor;

      process.stdout.write(`\rFetched: ${followers.length} (Page ${page})`);
      page++;
    } while (cursor);

    console.log('\n\n--- Summary ---');
    console.log(`Total Followers Fetched: ${followers.length}`);
    console.log(`Followers DID Count: ${profile.data.followersCount}`);
    const diff = (profile.data.followersCount || 0) - followers.length;
    console.log(`Difference: ${diff}`);

    if (diff > 0) {
      console.log('Note: The difference typically represents deleted, deactivated, or blocked accounts which are filtered out by the API.');
    }

    // Outputting list to file
    const fs = await import('fs');
    const filename = `followers_${handle}_${Date.now()}.json`;
    fs.writeFileSync(`./out/${filename}`, JSON.stringify(followers, null, 2));
    console.log(`\nDetailed follower list saved to: ${filename}`);

  } catch (err) {
    console.error('Error:', err);
    process.exit(1);
  }
}

main();
