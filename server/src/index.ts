import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import workspaceRoutes from './routes/workspace.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import projectRoutes from './routes/project.routes.js';
import projectFlatRoutes from './routes/projectFlat.routes.js';
import issueRoutes from './routes/issue.routes.js';
import issueFlatRoutes from './routes/issueFlat.routes.js';
import labelRoutes from './routes/label.routes.js';
import labelFlatRoutes from './routes/labelFlat.routes.js';
import commentRoutes from './routes/comment.routes.js';
import commentFlatRoutes from './routes/commentFlat.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/projects', projectRoutes);
app.use('/api/projects', projectFlatRoutes);
app.use('/api/projects/:projectId/issues', issueRoutes);
app.use('/api/issues', issueFlatRoutes);
app.use('/api/issues/:issueId/labels', labelRoutes);
app.use('/api/labels', labelFlatRoutes);
app.use('/api/issues/:issueId/comments', commentRoutes);
app.use('/api/comments', commentFlatRoutes);

app.use(errorHandler); 

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));