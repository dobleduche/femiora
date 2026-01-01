import express from 'express';
import oraRouter from './routes/ora';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use('/api/ora', oraRouter);

// Global error handling middleware
app.use((
  err: any,
  req: express.Request,
  res: express.Response,
  next: express.NextFunction
) => {
  // Log the error for debugging/monitoring
  console.error(err);

  const statusCode = typeof err?.status === 'number' ? err.status : 500;
  const message = statusCode === 500 ? 'Internal Server Error' : err.message || 'Error';

  res.status(statusCode).json({
    error: message,
  });
});
const envPort = parseInt(process.env.PORT ?? '', 10);
const port = Number.isNaN(envPort) ? 3001 : envPort;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Ora API listening on port ${port}`);
  });
}

export default app;
