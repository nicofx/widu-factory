import { Breakpoints } from '@angular/cdk/layout';
import { InjectionToken } from '@angular/core';

export interface ViewportBreakpoints {
  readonly MOBILE: string;          // hasta < 768 px
  readonly TABLET: string;          // 768 – 1023 px
  readonly DESKTOP: string;         // ≥ 1024 px
  readonly HANDSET: string;         // reutilizamos de CDK
  readonly WEB_PORTRAIT: string;    // ejemplo extra
  /* agrega los que quieras */
}

/** Token modificable desde la app raíz */
export const VIEWPORT_BREAKPOINTS = new InjectionToken<ViewportBreakpoints>(
  'VIEWPORT_BREAKPOINTS',
  {
    providedIn: 'root',
    factory: () => ({
      MOBILE: '(max-width: 767.99px)',
      TABLET: '(min-width: 768px) and (max-width: 1023.99px)',
      DESKTOP: '(min-width: 1024px)',
      HANDSET: Breakpoints.Handset,
      WEB_PORTRAIT: Breakpoints.WebPortrait
    })
  }
);
