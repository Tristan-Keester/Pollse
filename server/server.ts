import express, { Request, Response, NextFunction } from 'express';
import  path from 'path';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded())


app.get('/test', (_req: Request, res: Response) => {
  res.status(200).json('World changed');
})

app.get('/', (_req: Request, res: Response) => {
  res.status(200).sendFile(path.resolve(__dirname, './client/index.html'));
});

app.use('*', (_req: Request, res: Response) => {
  res.status(404).send('Nothings exists here :O')
});


type ServerError = {
  log: string,
  status: number,
  message: { err: string }
}
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

module.exports = app;