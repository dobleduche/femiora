import express from 'express';
import oraRouter from './routes/ora';

const app = express();

app.use(express.json({ limit: '1mb' }));
app.use('/api/ora', oraRouter);

const port = Number(process.env.PORT) || 3001;

if (process.env.NODE_ENV !== 'test') {
  app.listen(port, () => {
    console.log(`Ora API listening on port ${port}`);
  });
}

export default app;
