import "server-only";
import { db } from "./db";

import { and, eq, desc, count } from "drizzle-orm";
import { likes, users, images, comments } from "./db/schema";
import { sql } from "drizzle-orm";
import { clerkClient } from "@clerk/clerk-sdk-node";
import { userRelationships } from "./db/schema";
export async function getMyImages(page: number, limit: number) {
  const offset = (page - 1) * limit;

  const imageResults = await db
    .select()
    .from(images)
    .orderBy(desc(images.id))
    .limit(limit)
    .offset(offset);

  const [countResult] = await db
    .select({
      count: sql<number>`cast(count(*) as int)`,
    })
    .from(images);

  return { images: imageResults, totalCount: countResult?.count };
}
export async function getUserImages(userId: string) {
  const UserImages = await db.query.images.findMany({
    where: (images, { eq }) => eq(images.userId, userId),
  });

  return UserImages;
}

export async function getImageCount(userId: string): Promise<number> {
  const PostCount = await db.query.images.findMany({
    where: (images, { eq }) => eq(images.userId, userId),
  });

  return PostCount.length;
}

export async function getImageLikes(imageId: number): Promise<number> {
  const likes = await db.query.likes.findMany({
    where: (likes, { eq }) => eq(likes.imageId, imageId),
  });

  return likes.length;
}

export async function getFollowerCount(userId: string) {
  const result = await db.query.userRelationships.findMany({
    where: (userRelationships, { eq }) =>
      eq(userRelationships.followingId, userId),
  });

  return result.length;
}

export async function getFollowingCount(userId: string) {
  const result = await db.query.userRelationships.findMany({
    where: (userRelationships, { eq }) =>
      eq(userRelationships.followerId, userId),
  });

  return result.length;
}

export async function createUser(userId: string) {
  const profile = await clerkClient.users.getUser(userId);
  const profileImageUrl = profile.imageUrl;
  const fullName = `${profile.firstName} ${profile.lastName || ""}`;
  await db.insert(users).values({
    userId: userId,
    fullName: fullName,
    profileImageUrl: profileImageUrl,
  });
}

export async function findLike(userId: string, imageId: number) {
  const results = await db
    .select()
    .from(likes)
    .where((likes) => and(eq(likes.userId, userId), eq(likes.imageId, imageId)))
    .execute();

  return results[0] || null;
}

export async function removeLike(userId: string, imageId: number) {
  return await db
    .delete(likes)
    .where(and(eq(likes.userId, userId), eq(likes.imageId, imageId)));
}

export async function imageLiked(
  userId: string,
  imageId: number,
  like: boolean,
) {
  if (like) {
    return await db.insert(likes).values({
      userId: userId,
      imageId: imageId,
    });
  }
}

export async function createCaption(imageId: number, caption: string) {
  await db
    .update(images)
    .set({ description: caption })
    .where(eq(images.id, imageId))
    .execute();
}

export async function getCaption(imageId: number) {
  const images = await db.query.images.findMany({
    where: (images) => eq(images.id, imageId),
    limit: 1,
  });
  return images[0]?.description ?? null;
}

export async function getLatestImage(userId: string) {
  const results = await db
    .select()
    .from(images)
    .where(eq(images.userId, userId))
    .orderBy(desc(images.createdAt))
    .limit(1)
    .execute();

  return results[0] || null;
}

export async function putComment(
  userId: string,
  imageId: number,
  content: string,
) {
  await db.insert(comments).values({
    userId: userId,
    imageId: imageId,
    content: content,
  });
}

export async function getComments(imageId: number) {
  const results = await db
    .select({
      id: comments.id,
      userId: comments.userId,
      imageId: comments.imageId,
      content: comments.content,
      createdAt: comments.createdAt,
    })
    .from(comments)
    .where(eq(comments.imageId, imageId))
    .orderBy(desc(comments.createdAt))
    .execute();

  const commentsWithUserDetails = await Promise.all(
    results.map(async (comment) => {
      const user = await getUserDetails(comment.userId || "user-not-found");
      return {
        ...comment,
        fullName: user?.fullName || "Unknown",
        profileImageUrl: user?.profileImageUrl || "/default-profile.png",
      };
    }),
  );

  return commentsWithUserDetails;
}

export async function getUserDetails(userId: string) {
  const user = await db
    .select({
      userId: users.userId,
      fullName: users.fullName,
      profileImageUrl: users.profileImageUrl,
    })
    .from(users)
    .where(eq(users.userId, userId))
    .execute();

  return user[0] || null;
}

export async function getImageDetails(imageId: number) {
  const ImageDetails = await db
    .select({
      userId: images.userId,
      fullname: images.uploadedBy,
      profileImageUrl: images.profileImageUrl,
      url: images.url,
      description: images.description,
    })
    .from(images)
    .where(eq(images.id, imageId))
    .execute();

  return ImageDetails[0] || null;
}

export async function followUser(followerId: string, followingId: string) {
  await db
    .insert(userRelationships)
    .values({
      followerId,
      followingId,
    })
    .execute();
}

export async function getFollowStatus(followerId: string, followingId: string) {
  const followStatus = await db.query.userRelationships.findMany({
    where: (userRelationships) =>
      eq(userRelationships.followerId, followerId) &&
      eq(userRelationships.followingId, followingId),
    limit: 1,
  });
  return followStatus.length > 0;
}

export async function unfollowUser(followerId: string, followingId: string) {
  await db
    .delete(userRelationships)
    .where(
      and(
        eq(userRelationships.followerId, followerId),
        eq(userRelationships.followingId, followingId),
      ),
    )
    .execute();
}
