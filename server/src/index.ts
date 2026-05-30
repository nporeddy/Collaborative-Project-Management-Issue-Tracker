import "dotenv/config";
import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

import { authMiddleware } from "./middleware/authMiddleware.js";
import { errorHandler } from "./middleware/errorHandler.js";

import authRoutes from "./routes/auth.routes.js";
import workspaceRoutes from "./routes/workspace.routes.js";
import projectRoutes from "./routes/project.routes.js";
import projectFlatRoutes from "./routes/projectFlat.routes.js";
import issueRoutes from "./routes/issue.routes.js";
import issueFlatRoutes from "./routes/issueFlat.routes.js";
import labelRoutes from "./routes/label.routes.js";
import labelFlatRoutes from "./routes/labelFlat.routes.js";
import commentRoutes from "./routes/comment.routes.js";
import commentFlatRoutes from "./routes/commentFlat.routes.js";

const app = express();

app.use(cors({ origin: "http://localhost:5173", credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get("/health", (_req, res) => res.json({ status: "ok" }));

// Public auth routes — no middleware
app.use("/api/auth", authRoutes);

// PROTECTED — every line below must have authMiddleware
app.use("/api/workspaces", authMiddleware, workspaceRoutes);
app.use("/api/workspaces/:workspaceId/projects", authMiddleware, projectRoutes);
app.use("/api/projects", authMiddleware, projectFlatRoutes);
app.use("/api/projects/:projectId/issues", authMiddleware, issueRoutes);
app.use("/api/issues", authMiddleware, issueFlatRoutes);
app.use("/api/issues/:issueId/labels", authMiddleware, labelRoutes);
app.use("/api/labels", authMiddleware, labelFlatRoutes);
app.use("/api/issues/:issueId/comments", authMiddleware, commentRoutes);
app.use("/api/comments", authMiddleware, commentFlatRoutes);

app.use(errorHandler);

const PORT = 4000;
app.listen(PORT, () =>
  console.log(`Server running on http://localhost:${PORT}`),
);
