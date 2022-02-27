import 'zone.js/dist/zone-node';

import { ngExpressEngine } from '@nguniversal/express-engine';
import * as express from 'express';
import { join } from 'path';

import { AppServerModule } from './src/main.server';
import { APP_BASE_HREF } from '@angular/common';
import { existsSync } from 'fs';

const distFolder = join(process.cwd(), 'public');
const indexHtml = existsSync(join(distFolder, 'index.original.html')) ? 'index.original.html' : 'index';

// The Express app is exported so that it can be used by serverless Functions.
export function ngUniversalSetup(server: express.Express): express.Express {
  // Our Universal express-engine (found @ https://github.com/angular/universal/tree/master/modules/express-engine)
  server.engine('html', ngExpressEngine({
    bootstrap: AppServerModule,
  }));

  server.set('view engine', 'html');
  server.set('views', distFolder);

  console.log('Angular Universal Initialized');

  return server;
}

const staticFileOption = {
  maxAge: '1y'
};

export function handleStaticFileRequest(req: express.Request, res: express.Response, next: express.NextFunction) {
  return express.static(distFolder, staticFileOption)(req, res, next);
}

export function handleAppRequest(req: express.Request, res: express.Response) {
  res.render(indexHtml, { req, providers: [{ provide: APP_BASE_HREF, useValue: req.baseUrl }] });
}

export * from './src/main.server';
