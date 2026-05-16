import type { NextFunction, Request, Response } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { verifyAccessToken } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { publicUserSelect } from "../lib/selectors";
import { unauthorized } from "../lib/errors";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        name: string;
        email: string;
        createdAt: Date;
        updatedAt: Date;
      };
    }
  }
}

export async function requireAuth(req: Request, _res: Response, next: NextFunction) {
  try {
    const header = req.header("authorization");
    const [scheme, token] = header?.split(" ") ?? [];

    if (scheme !== "Bearer" || !token) {
      throw unauthorized();
    }

    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.sub },
      select: publicUserSelect
    });

    if (!user) {
      throw unauthorized("Invalid or expired token");
    }

    req.user = user;
    next();
  } catch (error) {
    if (error instanceof PrismaClientKnownRequestError) {
      next(error);
      return;
    }
    next(unauthorized("Invalid or expired token"));
  }
}
