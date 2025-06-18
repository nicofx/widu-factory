// packages/widu-devkit-web/src/services/viewport/viewport.service.ts
import { Injectable, signal, computed, inject, Signal } from '@angular/core';
import { BreakpointObserver, BreakpointState } from '@angular/cdk/layout';
import { fromEvent } from 'rxjs';
import { VIEWPORT_BREAKPOINTS, ViewportBreakpoints } from './viewport.tokens';

@Injectable({ providedIn: 'root' })
export class ViewportService {
  // ── Inyección de dependencias (en campo) ──
  private breakpoints: ViewportBreakpoints = inject(VIEWPORT_BREAKPOINTS);
  private bo:           BreakpointObserver  = inject(BreakpointObserver);

  // ── Señales de tamaño ──
  private widthSig  = signal(window.innerWidth);
  private heightSig = signal(window.innerHeight);

  // ── Señal de breakpoint activo ──
  private _currentBp = signal<string>('unknown');

  // ── Lecturas públicas ──
  readonly width     = this.widthSig.asReadonly();
  readonly height    = this.heightSig.asReadonly();
  readonly currentBp = this._currentBp.asReadonly();

  // ── Declaración de campos para los computed y signals de orientación ──
  readonly isMobile!:   Signal<boolean>;
  readonly isTablet!:   Signal<boolean>;
  readonly isDesktop!:  Signal<boolean>;
  readonly isPortrait!: Signal<boolean>;
  readonly isLandscape!:Signal<boolean>;
  readonly isTouch!:    Signal<boolean>;

  constructor() {
    // ── Signals que no dependen de la inyección ──
    this.isPortrait = signal(matchMedia('(orientation: portrait)').matches);
    this.isTouch    = signal(matchMedia('(pointer: coarse)').matches);

    // ── computed() **dentro** del constructor (contexto válido) ──
    this.isMobile   = computed(() => this.bo.isMatched(this.breakpoints.MOBILE));
    this.isTablet   = computed(() => this.bo.isMatched(this.breakpoints.TABLET));
    this.isDesktop  = computed(() => this.bo.isMatched(this.breakpoints.DESKTOP));
    this.isLandscape = computed(() => !this.isPortrait());

    // ── Actualizar tamaño al hacer resize ──
    fromEvent(window, 'resize').subscribe(() => {
      this.widthSig.set(window.innerWidth);
      this.heightSig.set(window.innerHeight);
    });

    // ── Observar breakpoints declarados ──
    const keys = Object.values(this.breakpoints);
    this.bo.observe(keys).subscribe((state: BreakpointState) => {
      const active = keys.find(q => state.breakpoints[q]) ?? 'unknown';
      this._currentBp.set(active);
    });
  }
}
