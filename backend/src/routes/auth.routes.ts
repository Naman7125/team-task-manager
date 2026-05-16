import { Router } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { asyncHandler } from "../lib/async-handler";
import { conflict, unauthorized } from "../lib/errors";
import { hashPassword, signAccessToken, verifyPassword } from "../lib/auth";
import { prisma } from "../lib/prisma";
import { publicUserSelect } from "../lib/selectors";
import { requireAuth } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { loginSchema, signupSchema } from "../schemas/auth";

export const authRouter = Router();

authRouter.post(
  "/signup",
  validate({ body: signupSchema }),
  asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;
    const passwordHash = await hashPassword(password);

    try {
      const user = await prisma.user.create({
        data: { name, email, passwordHash },
        select: publicUserSelect
      });

      const token = signAccessToken({ sub: user.id, email: user.email });
      res.status(201).json({ user, token });
    } catch (error) {
      if (error instanceof PrismaClientKnownRequestError && error.code === "P2002") {
        throw conflict("Email is already registered");
      }
      throw error;
    }
  })
);

authRouter.post(
  "/login",
  validate({ body: loginSchema }),
  asyncHandler(async (req, res) => {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });

    if (!user || !(await verifyPassword(password, user.passwordHash))) {
      throw unauthorized("Invalid email or password");
    }

    const token = signAccessToken({ sub: user.id, email: user.email });
    const { passwordHash: _passwordHash, ...safeUser } = user;
    res.json({ user: safeUser, token });
  })
);

authRouter.get("/me", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
