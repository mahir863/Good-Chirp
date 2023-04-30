
import type { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";

// Writing function to filter the user object as it contains much unnecessary things
const filterUserForClient = (user: User) => {
    return {
        id: user.id,
        username: user.username,
        profilePicture: user.profileImageUrl
    }
}

export const postsRouter = createTRPCRouter({
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({
        take: 100,
        orderBy: [{createdAt: "desc"}]
    })

    const users = (
        await clerkClient.users.getUserList({
            userId: posts.map((post) => post.authorId),
            limit: 100
        })
    ).filter(filterUserForClient)

    return posts.map((post) => ({
        post,
        author: users.find((user) => user.id === post.authorId)
    }));
  }),

  create: privateProcedure.input(z.object({
    content: z.string().min(1)
  })).mutation(async ({ctx, input}) => {
    const authorId = ctx.userId

    const post = await ctx.prisma.post.create({
        data: {
            authorId,
            content: input.content
        }
    })
    return post
  })

});
