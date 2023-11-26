import type { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes.js';

export const appConfig: ApplicationConfig = {
  providers: [provideRouter(routes)],
};
