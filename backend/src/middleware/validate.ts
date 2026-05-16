import type { RequestHandler } from "express";
import type { z, ZodTypeAny } from "zod";

type RequestParts = {
  body?: ZodTypeAny;
  query?: ZodTypeAny;
  params?: ZodTypeAny;
};

export function validate(parts: RequestParts): RequestHandler {
  return (req, _res, next) => {
    if (parts.body) req.body = parts.body.parse(req.body) as z.infer<typeof parts.body>;
    if (parts.query) req.query = parts.query.parse(req.query) as typeof req.query;
    if (parts.params) req.params = parts.params.parse(req.params) as typeof req.params;
    next();
  };
}
