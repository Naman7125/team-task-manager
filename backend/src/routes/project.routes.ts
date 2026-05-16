import { Router } from "express";
import { Prisma, ProjectRole } from "@prisma/client";
import { asyncHandler } from "../lib/async-handler";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { memberUserSelect } from "../lib/selectors";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { getPagination, idParamSchema } from "../schemas/common";
import {
  addMemberSchema,
  createProjectSchema,
  memberParamSchema,
  projectListQuerySchema,
  updateMemberSchema,
  updateProjectSchema
} from "../schemas/project";
import { requireProjectAdmin, requireProjectMember } from "../lib/access";

export const projectRouter = Router();

projectRouter.use(requireAuth);

const projectInclude = {
  owner: { select: memberUserSelect },
  members: {
    select: {
      role: true,
      createdAt: true,
      user: { select: memberUserSelect }
    },
    orderBy: { createdAt: "asc" as const }
  },
  _count: { select: { tasks: true, members: true } }
};

projectRouter.get(
  "/",
  validate({ query: projectListQuerySchema }),
  asyncHandler(async (req, res) => {
    const { page, pageSize, status, search } = req.query as unknown as {
      page: number;
      pageSize: number;
      status?: Prisma.ProjectWhereInput["status"];
      search?: string;
    };
    const where: Prisma.ProjectWhereInput = {
      members: { some: { userId: req.user!.id } },
      ...(status ? { status } : {}),
      ...(search
        ? {
            OR: [
              { name: { contains: search } },
              { description: { contains: search } }
            ]
          }
        : {})
    };
    const pagination = getPagination(page, pageSize);

    const [projects, total] = await prisma.$transaction([
      prisma.project.findMany({
        where,
        ...pagination,
        orderBy: { updatedAt: "desc" },
        include: projectInclude
      }),
      prisma.project.count({ where })
    ]);

    res.json({ data: projects, meta: { page, pageSize, total } });
  })
);

projectRouter.post(
  "/",
  validate({ body: createProjectSchema }),
  asyncHandler(async (req, res) => {
    const project = await prisma.project.create({
      data: {
        ...req.body,
        ownerId: req.user!.id,
        members: {
          create: {
            userId: req.user!.id,
            role: ProjectRole.ADMIN
          }
        }
      },
      include: projectInclude
    });

    res.status(201).json({ data: project });
  })
);

projectRouter.get(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectMember(projectId, req.user!.id);
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: projectInclude
    });

    if (!project) throw notFound("Project not found");
    res.json({ data: project });
  })
);

projectRouter.patch(
  "/:id",
  validate({ params: idParamSchema, body: updateProjectSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectAdmin(projectId, req.user!.id);
    const project = await prisma.project.update({
      where: { id: projectId },
      data: req.body,
      include: projectInclude
    });

    res.json({ data: project });
  })
);

projectRouter.delete(
  "/:id",
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectAdmin(projectId, req.user!.id);
    await prisma.project.delete({ where: { id: projectId } });
    res.status(204).send();
  })
);

projectRouter.get(
  "/:id/members",
  validate({ params: idParamSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectMember(projectId, req.user!.id);
    const members = await prisma.projectMembership.findMany({
      where: { projectId },
      orderBy: { createdAt: "asc" },
      select: {
        role: true,
        createdAt: true,
        user: { select: memberUserSelect }
      }
    });
    res.json({ data: members });
  })
);

projectRouter.post(
  "/:id/members",
  validate({ params: idParamSchema, body: addMemberSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectAdmin(projectId, req.user!.id);
    const user = await prisma.user.findUnique({
      where: { email: req.body.email },
      select: memberUserSelect
    });

    if (!user) throw notFound("User with this email does not exist");

    const member = await prisma.projectMembership.upsert({
      where: { userId_projectId: { userId: user.id, projectId } },
      create: { userId: user.id, projectId, role: req.body.role },
      update: { role: req.body.role },
      select: {
        role: true,
        createdAt: true,
        user: { select: memberUserSelect }
      }
    });

    res.status(201).json({ data: member });
  })
);

projectRouter.patch(
  "/:id/members/:userId",
  validate({ params: memberParamSchema, body: updateMemberSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    const userId = req.params.userId as string;
    await requireProjectAdmin(projectId, req.user!.id);

    if (userId === req.user!.id && req.body.role !== ProjectRole.ADMIN) {
      const adminCount = await prisma.projectMembership.count({
        where: { projectId, role: ProjectRole.ADMIN }
      });
      if (adminCount <= 1) throw badRequest("Project must keep at least one admin");
    }

    const member = await prisma.projectMembership.update({
      where: { userId_projectId: { userId, projectId } },
      data: { role: req.body.role },
      select: {
        role: true,
        createdAt: true,
        user: { select: memberUserSelect }
      }
    });

    res.json({ data: member });
  })
);

projectRouter.delete(
  "/:id/members/:userId",
  validate({ params: memberParamSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    const userId = req.params.userId as string;
    await requireProjectAdmin(projectId, req.user!.id);

    const membership = await prisma.projectMembership.findUnique({
      where: { userId_projectId: { userId, projectId } }
    });
    if (!membership) throw notFound("Project member not found");

    if (membership.role === ProjectRole.ADMIN) {
      const adminCount = await prisma.projectMembership.count({
        where: { projectId, role: ProjectRole.ADMIN }
      });
      if (adminCount <= 1) throw forbidden("Project must keep at least one admin");
    }

    await prisma.projectMembership.delete({
      where: { userId_projectId: { userId, projectId } }
    });
    res.status(204).send();
  })
);
