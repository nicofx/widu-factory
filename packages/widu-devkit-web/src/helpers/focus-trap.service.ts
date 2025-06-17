import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class FocusTrapService {
  private lastActive: HTMLElement | null = null;

  remember() { this.lastActive = document.activeElement as HTMLElement; }
  restore()  { this.lastActive?.focus(); }
}
