import { prisma } from "../lib/prisma.js";
import type { Status, Priority, IssueType } from "@prisma/client";
import { emitToProject } from "../lib/realtime.js";
import { memberService } from "./member.service.js";

interface ListParams {
  projectId: string;
  status?: Status;
  assigneeId?: string;
  page: number;
  limit: number;
}

export const issueService = {
  async create(
    projectId: string,
    data: {
      title: string;
      description?: string;
      priority?: Priority;
      type?: IssueType;
      assigneeId?: string | null;       
    },
  ) {
    if (data.assigneeId) {
      const project = await prisma.project.findUnique({
        where: { id: projectId },
        select: { workspaceId: true },
      });
      if (!project) throw new Error("PROJECT_NOT_FOUND");
      const isMember = await memberService.isMember(
        data.assigneeId,
        project.workspaceId,
      );
      if (!isMember) throw new Error("ASSIGNEE_NOT_MEMBER");
    }
    return prisma.issue.create({ data: { ...data, projectId } });
  },

  async list({ projectId, status, assigneeId, page, limit }: ListParams) {
    const where = {
      projectId,
      ...(status ? { status } : {}),
      ...(assigneeId ? { assigneeId } : {}),
    };

    const [items, total] = await Promise.all([
      prisma.issue.findMany({
        where: { projectId },
        include: {
          assignee: { select: { id: true, name: true, email: true } },
        },
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
      include: {
        labels: true,
        comments: {
          orderBy: { createdAt: "asc" },
          include: {
            author: { select: { id: true, name: true, email: true } },
          },
        },
        assignee: { select: { id: true, name: true, email: true } },
        project: { select: { id: true, name: true, workspaceId: true } }, // ← ADD
      },
    }),

  async update(
    id: string,
    data: {
      title?: string;
      description?: string;
      status?: Status;
      priority?: Priority;
      type?: IssueType;
      assigneeId?: string | null;
    },
  ) {
    if (data.assigneeId) {
      const issue = await prisma.issue.findUnique({
        where: { id },
        select: { project: { select: { workspaceId: true } } },
      });
      if (!issue) throw new Error("ISSUE_NOT_FOUND");
      const isMember = await memberService.isMember(
        data.assigneeId,
        issue.project.workspaceId,
      );
      if (!isMember) throw new Error("ASSIGNEE_NOT_MEMBER");
    }
    const issue = await prisma.issue.update({ where: { id }, data });
    emitToProject(issue.projectId, "issue:updated", issue);
    return issue;
  },

  remove: (id: string) => prisma.issue.delete({ where: { id } }),
};
