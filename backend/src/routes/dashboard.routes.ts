import { Router } from "express";
import { TaskStatus } from "@prisma/client";
import { asyncHandler } from "../lib/async-handler";
import { prisma } from "../lib/prisma";
import { requireAuth } from "../middleware/auth";

export const dashboardRouter = Router();

dashboardRouter.use(requireAuth);

dashboardRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const userId = req.user!.id;
    const now = new Date();
    const sevenDaysFromNow = new Date(now);
    sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);

    const accessibleTaskWhere = {
      project: {
        members: {
          some: { userId }
        }
      }
    };

    const [
      projectCount,
      assignedToMeCount,
      totalTasks,
      overdueTasks,
      dueSoonTasks,
      todoTasks,
      inProgressTasks,
      doneTasks,
      latestTasks
    ] = await prisma.$transaction([
      prisma.project.count({ where: { members: { some: { userId } } } }),
      prisma.task.count({ where: { assigneeId: userId } }),
      prisma.task.count({ where: accessibleTaskWhere }),
      prisma.task.count({
        where: {
          ...accessibleTaskWhere,
          dueDate: { lt: now },
          status: { not: TaskStatus.DONE }
        }
      }),
      prisma.task.count({
        where: {
          ...accessibleTaskWhere,
          dueDate: { gte: now, lte: sevenDaysFromNow },
          status: { not: TaskStatus.DONE }
        }
      }),
      prisma.task.count({ where: { ...accessibleTaskWhere, status: TaskStatus.TODO } }),
      prisma.task.count({ where: { ...accessibleTaskWhere, status: TaskStatus.IN_PROGRESS } }),
      prisma.task.count({ where: { ...accessibleTaskWhere, status: TaskStatus.DONE } }),
      prisma.task.findMany({
        where: accessibleTaskWhere,
        take: 8,
        orderBy: { updatedAt: "desc" },
        select: {
          id: true,
          title: true,
          status: true,
          priority: true,
          dueDate: true,
          updatedAt: true,
          project: { select: { id: true, name: true } },
          assignee: { select: { id: true, name: true, email: true } }
        }
      })
    ]);

    res.json({
      data: {
        projects: projectCount,
        tasks: {
          total: totalTasks,
          assignedToMe: assignedToMeCount,
          overdue: overdueTasks,
          dueSoon: dueSoonTasks,
          byStatus: {
            [TaskStatus.TODO]: todoTasks,
            [TaskStatus.IN_PROGRESS]: inProgressTasks,
            [TaskStatus.DONE]: doneTasks
          }
        },
        latestTasks
      }
    });
  })
);
