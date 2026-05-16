import type { ErrorRequestHandler, RequestHandler } from "express";
import { PrismaClientKnownRequestError } from "@prisma/client/runtime/library";
import { ZodError } from "zod";
import { AppError } from "../lib/errors";
import { env } from "../config/env";

export const notFoundHandler: RequestHandler = (req, _res, next) => {
  next(new AppError(404, `Route ${req.method} ${req.path} not found`, "ROUTE_NOT_FOUND"));
};

export const errorHandler: ErrorRequestHandler = (error, _req, res, _next) => {
  if (error instanceof ZodError) {
    res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Request validation failed",
        issues: error.flatten()
      }
    });
    return;
  }

  if (error instanceof PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      res.status(409).json({ error: { code: "CONFLICT", message: "Duplicate resource" } });
      return;
    }
    if (error.code === "P2025") {
      res.status(404).json({ error: { code: "NOT_FOUND", message: "Resource not found" } });
      return;
    }
  }

  if (error instanceof AppError) {
    res.status(error.statusCode).json({
      error: {
        code: error.code,
        message: error.message
      }
    });
    return;
  }

  res.status(500).json({
    error: {
      code: "INTERNAL_SERVER_ERROR",
      message: "Unexpected server error",
      detail: env.NODE_ENV === "development" ? String(error) : undefined
    }
  });
};
