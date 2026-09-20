import { Client } from 'pg';
import { randomUUID } from 'crypto';

async function main() {
  console.log('Seeding database using pg...');

  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error('DATABASE_URL is not set in environment.');
  }

  const client = new Client({
    connectionString,
  });

  await client.connect();

  try {
    // 1. Create a test user
    const userId = randomUUID();
    await client.query(`
      INSERT INTO "user" ("id", "email", "displayName", "avatarUrl", "updatedAt")
      VALUES ($1, $2, $3, $4, NOW())
      ON CONFLICT ("email") DO NOTHING;
    `, [userId, 'test@reeltune.app', 'Test User', 'https://i.pravatar.cc/150?u=test']);

    // Get the user ID in case it already existed
    const userRes = await client.query(`SELECT id FROM "user" WHERE email = $1`, ['test@reeltune.app']);
    const actualUserId = userRes.rows[0].id;

    console.log(`Test user ready with id: ${actualUserId}`);

    // 2. Create some test songs
    const songsData = [
      {
        id: randomUUID(),
        title: 'Blinding Lights',
        artists: ['The Weeknd'],
        album: 'After Hours',
        artwork: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
        duration: 200040,
        spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
      },
      {
        id: randomUUID(),
        title: 'Bohemian Rhapsody',
        artists: ['Queen'],
        album: 'A Night At The Opera',
        artwork: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
        duration: 354320,
        spotifyId: '3z8h0Tu7qPhdD26Vvs024s',
      },
      {
        id: randomUUID(),
        title: 'Levitating',
        artists: ['Dua Lipa'],
        album: 'Future Nostalgia',
        artwork: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
        duration: 203807,
        spotifyId: '463CkQjx2Zk1yXoBuierM9',
      },
    ];

    const actualSongIds = [];
    for (const song of songsData) {
      await client.query(`
        INSERT INTO "song" ("id", "title", "artists", "album", "artwork", "duration", "spotifyId")
        VALUES ($1, $2, $3, $4, $5, $6, $7)
        ON CONFLICT ("spotifyId") DO NOTHING;
      `, [song.id, song.title, song.artists, song.album, song.artwork, song.duration, song.spotifyId]);

      const res = await client.query(`SELECT id FROM "song" WHERE "spotifyId" = $1`, [song.spotifyId]);
      actualSongIds.push(res.rows[0].id);
    }

    console.log(`Seeded ${actualSongIds.length} test songs.`);

    // 3. Add songs to the user's saved songs
    for (const songId of actualSongIds) {
      await client.query(`
        INSERT INTO "savedSong" ("id", "userId", "songId")
        VALUES ($1, $2, $3)
        ON CONFLICT ("userId", "songId") DO NOTHING;
      `, [randomUUID(), actualUserId, songId]);
    }

    console.log('Saved songs for test user.');
    console.log('Seeding complete!');
  } finally {
    await client.end();
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
