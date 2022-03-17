import * as express from 'express';
import * as path from 'path';

// The Express app is exported so that it can be used by serverless Functions.
export function ngUniversalSetup(server: express.Express): express.Express {
  return server;
}

export function handleStaticFileRequest(
  req: express.Request,
  res: express.Response,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  next: express.NextFunction,
) {
  res.sendFile(path.join(__dirname, '../public/', req.path));
}

export function handleAppRequest(req: express.Request, res: express.Response) {
  res.sendFile(path.join(__dirname, '../public/index.html'));
}
