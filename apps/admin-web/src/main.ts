import { enableProdMode }      from '@angular/core';
import { bootstrapApplication } from '@angular/platform-browser';
import { AppComponent }        from './app/app.component';
import { importProvidersFrom } from '@angular/core';
import { BrowserModule }       from '@angular/platform-browser';
import { AppInjector } from '@widu/devkit-web';

// if (environment.production) {
//   enableProdMode();
// }

bootstrapApplication(AppComponent, {
  providers: [
    importProvidersFrom(BrowserModule),
    AppInjector  // << aquí para que Angular cree la instancia y llene el .injector

  ]
})
.catch(err => {
  Error.stackTraceLimit = Infinity
  console.error(err);
});
