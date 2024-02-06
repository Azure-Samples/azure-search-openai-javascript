import { importProvidersFrom } from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { provideHttpClient } from '@angular/common/http';
import { provideAnimations } from '@angular/platform-browser/animations';
import { MatNativeDateModule } from '@angular/material/core';
import { AppSettingsComponent } from './app-settings/app-settings.component.js';

bootstrapApplication(AppSettingsComponent, {
  providers: [provideAnimations(), provideHttpClient(), importProvidersFrom(MatNativeDateModule)],
  // eslint-disable-next-line unicorn/prefer-top-level-await
}).catch((error) => console.error(error));
