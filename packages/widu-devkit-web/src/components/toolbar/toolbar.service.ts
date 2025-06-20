// packages/widu-devkit-web/src/components/toolbar/toolbar.service.ts

import { Injectable, signal, Signal } from '@angular/core';

/**
 * ToolbarService v1.0
 *
 * Gestiona el estado del toolbar con señales reactivas:
 * – height: altura fija
 * – sticky: fija en top
 * – locked: impide togglear sticky
 * – background & color: theming
 * – elevation: sombra preset
 * – visible: mostrar u ocultar toolbar
 * – mode: 'view' | 'edit'
 */
@Injectable({ providedIn: 'root' })
export class ToolbarService {
  private heightSig    = signal<string>('3rem');
  private stickySig    = signal<boolean>(false);
  private lockedSig    = signal<boolean>(false);
  private backgroundSig= signal<string>('#fff');
  private colorSig     = signal<string>('#333');
  private elevationSig = signal<'none'|'sm'|'md'|'lg'>('none');
  private visibleSig   = signal<boolean>(true);
  private modeSig      = signal<'view'|'edit'>('view');

  readonly height    : Signal<string>       = this.heightSig.asReadonly();
  readonly sticky    : Signal<boolean>      = this.stickySig.asReadonly();
  readonly locked    : Signal<boolean>      = this.lockedSig.asReadonly();
  readonly background: Signal<string>       = this.backgroundSig.asReadonly();
  readonly color     : Signal<string>       = this.colorSig.asReadonly();
  readonly elevation : Signal<'none'|'sm'|'md'|'lg'> = this.elevationSig.asReadonly();
  readonly visible   : Signal<boolean>      = this.visibleSig.asReadonly();
  readonly mode      : Signal<'view'|'edit'> = this.modeSig.asReadonly();

  setHeight(v: string)                    { this.heightSig.set(v); }
  setSticky(v: boolean)                  { if (!this.lockedSig()) this.stickySig.set(v); }
  setLocked(v: boolean)                  { this.lockedSig.set(v); }
  setBackground(v: string)               { this.backgroundSig.set(v); }
  setColor(v: string)                    { this.colorSig.set(v); }
  setElevation(v: 'none'|'sm'|'md'|'lg') { this.elevationSig.set(v); }
  setVisible(v: boolean)                 { this.visibleSig.set(v); }
  toggleVisible()                        { this.visibleSig.update(x => !x); }
  setMode(v: 'view'|'edit')              { this.modeSig.set(v); }
  toggleMode()                           { this.modeSig.update(m => m==='view'?'edit':'view'); }
}