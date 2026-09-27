import { PrismaService } from './src/prisma/prisma.service.js';
import { UsersService } from './src/users/users.service.js';
import { PlaylistsService } from './src/playlists/playlists.service.js';

async function main() {
  const prisma = new PrismaService();
  const usersService = new UsersService(prisma);
  const playlistsService = new PlaylistsService(prisma);

  // 1. Create two test users
  const user1 = await prisma.user.create({ data: { email: 'test1_social@example.com', displayName: 'Test 1' } });
  const user2 = await prisma.user.create({ data: { email: 'test2_social@example.com', displayName: 'Test 2' } });

  console.log('Created users:', user1.id, user2.id);

  try {
    // 2. Test self-follow rejection
    try {
      await usersService.followUser(user1.id, user1.id);
      throw new Error('Self follow should have failed');
    } catch (e: any) {
      if (e.message !== 'You cannot follow yourself') throw e;
      console.log('✅ Self follow rejected correctly');
    }

    // 3. Test follow user
    await usersService.followUser(user1.id, user2.id);
    console.log('✅ User 1 followed User 2');

    // 4. Test duplicate follow
    const dup = await usersService.followUser(user1.id, user2.id);
    if (!dup.alreadyFollowing) throw new Error('Duplicate follow failed to detect');
    console.log('✅ Duplicate follow prevented safely');

    // 5. Test follower/following retrieval
    const followers = await usersService.getFollowers(user2.id);
    if (followers.length !== 1 || followers[0].id !== user1.id) throw new Error('Followers incorrect');
    console.log('✅ Followers retrieved');

    const following = await usersService.getFollowing(user1.id);
    if (following.length !== 1 || following[0].id !== user2.id) throw new Error('Following incorrect');
    console.log('✅ Following retrieved');

    // 6. Test unfollow
    await usersService.unfollowUser(user1.id, user2.id);
    const followingAfter = await usersService.getFollowing(user1.id);
    if (followingAfter.length !== 0) throw new Error('Unfollow failed');
    console.log('✅ Unfollow successful');

    // 7. Create a private playlist for user2
    const privatePlaylist = await prisma.playlist.create({
      data: { name: 'Private', isPrivate: true, userId: user2.id }
    });

    // 8. Liking private playlist rejection
    try {
      await playlistsService.likePlaylist(user1.id, privatePlaylist.id);
      throw new Error('Should not be able to like private playlist');
    } catch (e: any) {
      if (e.message !== 'Cannot like private playlists') throw e;
      console.log('✅ Private playlist like rejected correctly');
    }

    // 9. Create a public playlist for user2
    const publicPlaylist = await prisma.playlist.create({
      data: { name: 'Public', isPrivate: false, userId: user2.id }
    });

    // 10. Like public playlist
    await playlistsService.likePlaylist(user1.id, publicPlaylist.id);
    console.log('✅ Liked public playlist');

    // 11. Duplicate like
    const dupLike = await playlistsService.likePlaylist(user1.id, publicPlaylist.id);
    if (!dupLike.alreadyLiked) throw new Error('Duplicate like failed to detect');
    console.log('✅ Duplicate like prevented safely');

    // 12. Unlike
    await playlistsService.unlikePlaylist(user1.id, publicPlaylist.id);
    console.log('✅ Unliked public playlist');

  } finally {
    // Cleanup
    await prisma.user.delete({ where: { id: user1.id } });
    await prisma.user.delete({ where: { id: user2.id } });
    await prisma.$disconnect();
    console.log('Cleanup complete');
  }
}
main().catch(console.error);
