import { ApplicationConfig, importProvidersFrom } from '@angular/core';
import { provideRouter } from '@angular/router';

import { HttpClientModule } from '@angular/common/http';
import { NgxsReduxDevtoolsPluginModule } from '@ngxs/devtools-plugin';
import { NgxsModule } from '@ngxs/store';
import { environment } from '../environments/environment.development';
import { routes } from './app.routes';
import { KnowledgeGraphState } from './knowledge-graph/state/knowledge-graph.state';

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    importProvidersFrom(HttpClientModule),
    importProvidersFrom(
      NgxsModule.forRoot([KnowledgeGraphState], {
        developmentMode: !environment.production,
      })
    ),
    importProvidersFrom(
      NgxsReduxDevtoolsPluginModule.forRoot({
        disabled: environment.production,
      })
    ),
  ],
};
