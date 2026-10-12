import { currentUser } from "@clerk/nextjs/server";
import { db } from "./prisma";
import { cache } from "react";

/**
 * Request-memoized user sync helper.
 * Uses React cache() to deduplicate execution across Server Components in a single request lifecycle.
 */
export const checkUser = cache(async () => {
  const user = await currentUser();

  if (!user) {
    return null;
  }

  try {
    const loggedInUser = await db.user.findUnique({
      where: {
        clerkUserId: user.id,
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        industry: true,
        experience: true,
        bio: true,
        skills: true,
      },
    });

    if (loggedInUser) {
      return loggedInUser;
    }

    const name = `${user.firstName || ""} ${user.lastName || ""}`.trim() || "User";

    const newUser = await db.user.create({
      data: {
        clerkUserId: user.id,
        name,
        imageUrl: user.imageUrl,
        email: user.emailAddresses?.[0]?.emailAddress || "",
      },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        industry: true,
        experience: true,
        bio: true,
        skills: true,
      },
    });

    return newUser;
  } catch (error) {
    console.error("[checkUser] Failed to verify or synchronize user:", error);
    return null;
  }
});

/**
 * Request-memoized database user getter by Clerk ID.
 * Deduplicates database lookups across RSC trees and Server Actions in a single request.
 */
export const getAuthenticatedDbUser = cache(async (clerkUserId) => {
  if (!clerkUserId) return null;

  try {
    return await db.user.findUnique({
      where: { clerkUserId },
      select: {
        id: true,
        clerkUserId: true,
        email: true,
        name: true,
        imageUrl: true,
        industry: true,
        experience: true,
        bio: true,
        skills: true,
      },
    });
  } catch (error) {
    console.error("[getAuthenticatedDbUser] Query error:", error);
    return null;
  }
});
