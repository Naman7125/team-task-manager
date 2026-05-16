import { Router } from "express";
import { asyncHandler } from "../lib/async-handler";
import { prisma } from "../lib/prisma";
import { memberUserSelect } from "../lib/selectors";
import { requireAuth } from "../middleware/auth";

export const userRouter = Router();

userRouter.use(requireAuth);

userRouter.get(
  "/",
  asyncHandler(async (req, res) => {
    const search = typeof req.query.search === "string" ? req.query.search.trim() : "";
    const users = await prisma.user.findMany({
      where: search
        ? {
            OR: [
              { name: { contains: search } },
              { email: { contains: search } }
            ]
          }
        : undefined,
      take: 20,
      orderBy: { name: "asc" },
      select: memberUserSelect
    });

    res.json({ data: users });
  })
);
