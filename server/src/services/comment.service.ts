import { prisma } from "../lib/prisma.js";
import { emitToProject } from "../lib/realtime.js";
export const commentService = {
  async create(issueId: string, data: { body: string; authorId: string }) {
    const comment = await prisma.comment.create({
      data: { ...data, issueId },
      include: { author: { select: { id: true, name: true, email: true } } },
    });

    // Look up the project to find the room
    const issue = await prisma.issue.findUnique({
      where: { id: issueId },
      select: { projectId: true },
    });

    if (issue) {
      emitToProject(issue.projectId, "comment:created", {
        comment,
        actorId: data.authorId,
      });
    }

    return comment;
  },

  async remove(id: string) {
    // Find the issue/project before deletion so we can broadcast after
    const existing = await prisma.comment.findUnique({
      where: { id },
      select: {
        issueId: true,
        authorId: true,
        issue: { select: { projectId: true } },
      },
    });

    await prisma.comment.delete({ where: { id } });

    if (existing) {
      emitToProject(existing.issue.projectId, "comment:deleted", {
        commentId: id,
        issueId: existing.issueId,
        actorId: existing.authorId,
      });
    }
  },

  listByIssue: (issueId: string) =>
    prisma.comment.findMany({
      where: { issueId },
      orderBy: { createdAt: "asc" },
      include: { author: true },
    }),
};
