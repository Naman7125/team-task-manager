import compression from "compression";
import cors from "cors";
import express from "express";
import rateLimit from "express-rate-limit";
import helmet from "helmet";
import morgan from "morgan";
import { corsOrigins, env } from "./config/env";
import { authRouter } from "./routes/auth.routes";
import { dashboardRouter } from "./routes/dashboard.routes";
import { projectRouter } from "./routes/project.routes";
import { taskRouter } from "./routes/task.routes";
import { userRouter } from "./routes/user.routes";
import { errorHandler, notFoundHandler } from "./middleware/error-handler";

export const app = express();

app.set("trust proxy", 1);
app.use(helmet());
app.use(
  cors({
    origin: corsOrigins === "*" ? true : corsOrigins,
    credentials: corsOrigins !== "*"
  })
);
app.use(compression());
app.use(express.json({ limit: "1mb" }));
app.use(morgan(env.NODE_ENV === "production" ? "combined" : "dev"));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    standardHeaders: true,
    legacyHeaders: false
  })
);

app.get("/health", (_req, res) => {
  res.json({ status: "ok", uptime: process.uptime() });
});

app.use("/api/auth", authRouter);
app.use("/api/projects", projectRouter);
app.use("/api", taskRouter);
app.use("/api/dashboard", dashboardRouter);
app.use("/api/users", userRouter);
app.use(notFoundHandler);
app.use(errorHandler);
