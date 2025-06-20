import { Injectable, signal, Signal } from '@angular/core';
import { ViewportService }            from '@widu/devkit-web';

/**
 * HeaderService v1.0
 * – height, sticky, locked, zones, subtitleLines, background, color, elevation
 * Señales reactivas para cada propiedad.
 */
@Injectable({ providedIn: 'root' })
export class HeaderService {
  private heightSig        = signal<string>('4rem');
  private stickySig        = signal<boolean>(true);
  private lockedSig        = signal<boolean>(false);
  private zonesSig         = signal<('left'|'center'|'right')[]>(['left','center','right']);
  private subtitleLinesSig = signal<1|2>(1);
  private backgroundSig    = signal<string>('#fff');
  private colorSig         = signal<string>('#333');
  private elevationSig     = signal<'none'|'sm'|'md'|'lg'>('none');

  readonly height        : Signal<string>       = this.heightSig.asReadonly();
  readonly sticky        : Signal<boolean>      = this.stickySig.asReadonly();
  readonly locked        : Signal<boolean>      = this.lockedSig.asReadonly();
  readonly zones         : Signal<('left'|'center'|'right')[]> = this.zonesSig.asReadonly();
  readonly subtitleLines : Signal<1|2>          = this.subtitleLinesSig.asReadonly();
  readonly background    : Signal<string>       = this.backgroundSig.asReadonly();
  readonly color         : Signal<string>       = this.colorSig.asReadonly();
  readonly elevation     : Signal<'none'|'sm'|'md'|'lg'> = this.elevationSig.asReadonly();

  constructor(public vp: ViewportService) {}

  setHeight(v: string)                      { this.heightSig.set(v); }
  setSticky(v: boolean)                    { if (!this.lockedSig()) this.stickySig.set(v); }
  setLocked(v: boolean)                    { this.lockedSig.set(v); }
  setZones(v: ('left'|'center'|'right')[]) { this.zonesSig.set(v); }
  setSubtitleLines(v: 1|2)                 { this.subtitleLinesSig.set(v); }
  setBackground(v: string)                 { this.backgroundSig.set(v); }
  setColor(v: string)                      { this.colorSig.set(v); }
  setElevation(v: 'none'|'sm'|'md'|'lg')   { this.elevationSig.set(v); }
}
