import { prisma } from "../lib/prisma.js";
import type { Status, Priority, IssueType  } from "@prisma/client";
import { emitToProject } from "../lib/realtime.js";
interface ListParams {
  projectId: string;
  status?: Status;
  assigneeId?: string;
  page: number;
  limit: number;
}

export const issueService = {
  create: (
    projectId: string,
    data: {
      title: string;
      description?: string;
      priority?: Priority;
      type?: IssueType
      assigneeId?: string;
    },
  ) => prisma.issue.create({ data: { ...data, projectId } }),

  async list({ projectId, status, assigneeId, page, limit }: ListParams) {
    const where = {
      projectId,
      ...(status ? { status } : {}),
      ...(assigneeId ? { assigneeId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where,
        orderBy: { createdAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.issue.count({ where }),
    ]);

    return {
      items,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  },

  findById: (id: string) =>
    prisma.issue.findUnique({
      where: { id },
      include: { comments: true, labels: true, assignee: true },
    }),

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: Status;
      priority?: Priority;
      type?: IssueType
      assigneeId?: string | null;
    },
  ) {
    const issue = await prisma.issue.update({
      where: { id },
      data,
    });

    emitToProject(issue.projectId, "issue:updated", issue);

    return issue;
  },

  remove: (id: string) => prisma.issue.delete({ where: { id } }),
};
