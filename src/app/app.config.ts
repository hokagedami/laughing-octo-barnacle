import {ApplicationConfig, importProvidersFrom, provideZoneChangeDetection} from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {provideNgxToastAlerts} from "ngx-toast-alerts";
import {provideHttpClient} from "@angular/common/http";

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    provideNgxToastAlerts({
      // Optional: Provide default configuration
      timeout: 3000,
      clickToClose: true,
      position: 'top-right',
      disableTimeout: false
    }),
    provideHttpClient()
  ]
};
