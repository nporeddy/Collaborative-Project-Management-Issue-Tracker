import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import workspaceRoutes from './routes/workspace.routes.js';
import { errorHandler } from './middleware/errorHandler.js';
import projectRoutes from './routes/project.routes.js';
import projectFlatRoutes from './routes/projectFlat.routes.js';

const app = express();
app.use(cors());
app.use(express.json());

app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use('/api/workspaces', workspaceRoutes);
app.use('/api/workspaces/:workspaceId/projects', projectRoutes);
app.use('/api/projects', projectFlatRoutes);

app.use(errorHandler); 

const PORT = 4000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));