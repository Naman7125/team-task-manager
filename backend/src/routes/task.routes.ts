import { Router } from "express";
import { Prisma, ProjectRole } from "@prisma/client";
import { asyncHandler } from "../lib/async-handler";
import { badRequest, forbidden, notFound } from "../lib/errors";
import { prisma } from "../lib/prisma";
import { memberUserSelect } from "../lib/selectors";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { requireProjectAdmin, requireProjectMember } from "../lib/access";
import { getPagination, idParamSchema, taskIdParamSchema } from "../schemas/common";
import { createTaskSchema, taskListQuerySchema, updateTaskSchema } from "../schemas/task";

export const taskRouter = Router();

taskRouter.use(requireAuth);

const taskInclude = {
  assignee: { select: memberUserSelect },
  createdBy: { select: memberUserSelect },
  project: { select: { id: true, name: true, status: true } }
};

async function ensureAssigneeIsMember(projectId: string, assigneeId?: string | null) {
  if (!assigneeId) return;
  const membership = await prisma.projectMembership.findUnique({
    where: { userId_projectId: { userId: assigneeId, projectId } }
  });
  if (!membership) throw badRequest("Assignee must be a project member");
}

taskRouter.get(
  "/projects/:id/tasks",
  validate({ params: idParamSchema, query: taskListQuerySchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectMember(projectId, req.user!.id);
    const { page, pageSize, status, priority, assigneeId, overdue } = req.query as unknown as {
      page: number;
      pageSize: number;
      status?: Prisma.TaskWhereInput["status"];
      priority?: Prisma.TaskWhereInput["priority"];
      assigneeId?: string;
      overdue?: boolean;
    };
    const now = new Date();
    const where: Prisma.TaskWhereInput = {
      projectId,
      ...(status ? { status } : {}),
      ...(priority ? { priority } : {}),
      ...(assigneeId ? { assigneeId } : {}),
      ...(overdue ? { dueDate: { lt: now }, status: { not: "DONE" } } : {})
    };
    const pagination = getPagination(page, pageSize);

    const [tasks, total] = await prisma.$transaction([
      prisma.task.findMany({
        where,
        ...pagination,
        orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
        include: taskInclude
      }),
      prisma.task.count({ where })
    ]);

    res.json({ data: tasks, meta: { page, pageSize, total } });
  })
);

taskRouter.post(
  "/projects/:id/tasks",
  validate({ params: idParamSchema, body: createTaskSchema }),
  asyncHandler(async (req, res) => {
    const projectId = req.params.id as string;
    await requireProjectAdmin(projectId, req.user!.id);
    await ensureAssigneeIsMember(projectId, req.body.assigneeId);

    const task = await prisma.task.create({
      data: {
        ...req.body,
        projectId,
        createdById: req.user!.id
      },
      include: taskInclude
    });

    res.status(201).json({ data: task });
  })
);

taskRouter.get(
  "/tasks/:taskId",
  validate({ params: taskIdParamSchema }),
  asyncHandler(async (req, res) => {
    const taskId = req.params.taskId as string;
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: taskInclude
    });

    if (!task) throw notFound("Task not found");
    await requireProjectMember(task.projectId, req.user!.id);
    res.json({ data: task });
  })
);

taskRouter.patch(
  "/tasks/:taskId",
  validate({ params: taskIdParamSchema, body: updateTaskSchema }),
  asyncHandler(async (req, res) => {
    const taskId = req.params.taskId as string;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw notFound("Task not found");

    const membership = await requireProjectMember(task.projectId, req.user!.id);
    const isAdmin = membership.role === ProjectRole.ADMIN;
    const isAssignee = task.assigneeId === req.user!.id;

    if (!isAdmin) {
      const allowedKeys = ["status"];
      const requestedKeys = Object.keys(req.body);
      const onlyStatusUpdate = requestedKeys.length > 0 && requestedKeys.every((key) => allowedKeys.includes(key));
      if (!isAssignee || !onlyStatusUpdate) {
        throw forbidden("Members can only update the status of tasks assigned to them");
      }
    }

    if (isAdmin) {
      await ensureAssigneeIsMember(task.projectId, req.body.assigneeId);
    }

    const updatedTask = await prisma.task.update({
      where: { id: taskId },
      data: req.body,
      include: taskInclude
    });

    res.json({ data: updatedTask });
  })
);

taskRouter.delete(
  "/tasks/:taskId",
  validate({ params: taskIdParamSchema }),
  asyncHandler(async (req, res) => {
    const taskId = req.params.taskId as string;
    const task = await prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw notFound("Task not found");

    await requireProjectAdmin(task.projectId, req.user!.id);
    await prisma.task.delete({ where: { id: taskId } });
    res.status(204).send();
  })
);
