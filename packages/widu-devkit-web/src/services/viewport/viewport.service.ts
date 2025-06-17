import { Injectable, inject, signal, computed, effect, Signal } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { fromEvent } from 'rxjs';
import { VIEWPORT_BREAKPOINTS, ViewportBreakpoints } from './viewport.tokens';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  private breakpoints = inject(VIEWPORT_BREAKPOINTS);
  private bo          = inject(BreakpointObserver);

  /* ---------- signals ---------- */
  private widthSig  = signal(window.innerWidth);
  private heightSig = signal(window.innerHeight);

  /* update on resize */
  constructor() {
    fromEvent(window, 'resize').subscribe(() => {
      this.widthSig.set(window.innerWidth);
      this.heightSig.set(window.innerHeight);
    });

    /* escucha los breakpoints declarados */
    const keys = Object.values(this.breakpoints);
    this.bo.observe(keys).subscribe((state: BreakpointState) => {
      this._currentBp.set(
        keys.find(q => state.breakpoints[q]) ?? 'unknown'
      );
    });
  }

  /* tamaño raw */
  readonly width  = this.widthSig.asReadonly();
  readonly height = this.heightSig.asReadonly();

  /* breakpoint activo */
  private _currentBp = signal<string>('unknown');
  readonly currentBp = this._currentBp.asReadonly();

  /* helpers booleanos */
  readonly isMobile:  Signal<boolean> = computed(() => this.bo.isMatched(this.breakpoints.MOBILE));
  readonly isTablet:  Signal<boolean> = computed(() => this.bo.isMatched(this.breakpoints.TABLET));
  readonly isDesktop: Signal<boolean> = computed(() => this.bo.isMatched(this.breakpoints.DESKTOP));

  /* orientación */
  readonly isPortrait = signal(matchMedia('(orientation: portrait)').matches);
  readonly isLandscape = computed(() => !this.isPortrait());

  /* touch vs mouse */
  readonly isTouch = signal(matchMedia('(pointer: coarse)').matches);
}
