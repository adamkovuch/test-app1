import * as express from "express";


// The Express app is exported so that it can be used by serverless Functions.
export function ngUniversalSetup(server: express.Express): express.Express { 
    return server;
}

export function handleStaticFileRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
    res.status(404).send('NgUniversal not initialized');
}

export function handleAppRequest(req: express.Request, res: express.Response) {
    res.status(404).send('NgUniversal not initialized');
}