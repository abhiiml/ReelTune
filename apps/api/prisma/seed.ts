import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database via Prisma...');

  // 1. Create a test user
  const user = await prisma.user.upsert({
    where: { email: 'test@reeltune.app' },
    update: {},
    create: {
      email: 'test@reeltune.app',
      displayName: 'Test User',
      avatarUrl: 'https://i.pravatar.cc/150?u=test',
    },
  });

  console.log(`Test user ready: ${user.id}`);

  // 2. Seed test songs
  const songsData = [
    {
      title: 'Blinding Lights',
      artists: ['The Weeknd'],
      album: 'After Hours',
      artwork: 'https://i.scdn.co/image/ab67616d0000b2738863bc11d2aa12b54f5aeb36',
      duration: 200040,
      spotifyId: '0VjIjW4GlUZAMYd2vXMi3b',
    },
    {
      title: 'Bohemian Rhapsody',
      artists: ['Queen'],
      album: 'A Night At The Opera',
      artwork: 'https://i.scdn.co/image/ab67616d0000b273ce4f1737bc8a646c8c4bd25a',
      duration: 354320,
      spotifyId: '3z8h0Tu7qPhdD26Vvs024s',
    },
    {
      title: 'Levitating',
      artists: ['Dua Lipa'],
      album: 'Future Nostalgia',
      artwork: 'https://i.scdn.co/image/ab67616d0000b273bd26ede1ae69327010d49946',
      duration: 203807,
      spotifyId: '463CkQjx2Zk1yXoBuierM9',
    },
  ];

  for (const song of songsData) {
    const seeded = await prisma.song.upsert({
      where: { spotifyId: song.spotifyId },
      update: {},
      create: song,
    });

    // 3. Add each song to the test user's saved songs
    await prisma.savedSong.upsert({
      where: { userId_songId: { userId: user.id, songId: seeded.id } },
      update: {},
      create: { userId: user.id, songId: seeded.id },
    });
  }

  console.log('Seeded 3 songs and saved them for test user.');
  console.log('Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
