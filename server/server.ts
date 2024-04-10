import express, { Request, Response, NextFunction } from 'express';
import  path from 'path';

import { ServerError } from './types';

const app = express();
const PORT = 3000;

app.use(express.json());

import pollRouter from './Routes/pollRouter';

app.use('/api/poll', pollRouter);

app.get('/api/test', (_req, res) => {
  res.status(200).json('World changed');
});

app.get('/*', (_req, res) => {
  res.status(200).sendFile(path.join(__dirname, '../client/index.html'));
});

app.use('*', (_req, res) => {
  res.status(404).send('Nothings exists here :O')
});



// Error handler
app.use((err: ServerError, _req: Request, res: Response, _next: NextFunction) => {
  const defaultErr = {
    log: 'Express error handler caught unknown middleware error',
    status: 500,
    message: { err: 'An error occurred' },
  };
  const errorObj = Object.assign({}, defaultErr, err);
  console.log(errorObj.log);
  return res.status(errorObj.status).json(errorObj.message);
});

// Begins listening to port 3000
app.listen(PORT, () => {
  console.log(`Server listening on port: ${PORT}...`);
});
