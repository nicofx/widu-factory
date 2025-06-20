import {
  Component,
  Input,
  HostBinding
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { ToolbarService }  from './toolbar.service';
import { ViewportService } from '@widu/devkit-web';

@Component({
  selector: 'widu-toolbar',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent {
  constructor(
    public ts: ToolbarService,
    private vp: ViewportService  // para detectar mobile/desktop
  ) {}

  // ── Inputs que actualizan el servicio ─────────────────────────

  @Input() set height(v: string)    
    { this.ts.setHeight(v); }

  @Input('sticky') set stickyIn(v: boolean)  
    { this.ts.setSticky(v); }

  @Input('locked') set lockedIn(v: boolean)  
    { this.ts.setLocked(v); }

  @Input() set background(v: string)  
    { this.ts.setBackground(v); }

  @Input() set color(v: string)       
    { this.ts.setColor(v); }

  @Input() set elevation(v: 'none'|'sm'|'md'|'lg') 
    { this.ts.setElevation(v); }

  @Input() set visible(v: boolean)    
    { this.ts.setVisible(v); }

  @Input() set mode(v: 'view'|'edit') 
    { this.ts.setMode(v); }

  // ── Nuevos Inputs para mobile & alineación vertical ───────────

  /** Ocultar zonas en mobile (left/center/right) */
  @Input() hideOnMobile: {
    left?: boolean;
    center?: boolean;
    right?: boolean;
  } = {};

  /** Alineación vertical: top|center|bottom */
  @Input() set verticalAlign(v: 'top'|'center'|'bottom') {
    const map = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const;
    this._cssVert = map[v] || map.center;
  }
  private _cssVert: string = 'center';

  // ── Decide si cada zona se ve ahora ───────────────────────────

  zoneVisible(zone: 'left'|'center'|'right'): boolean {
    if (!this.ts.visible()) return false;
    // en mobile, si hideOnMobile zona = true → ocultar
    if (this.vp.isMobile() && this.hideOnMobile[zone]) return false;
    return true;
  }

  // ── HostBindings para estilos y clases en <widu-toolbar> ───────

  /** Oculta todo el toolbar */
  @HostBinding('class.hidden')
    get hiddenClass() { return !this.ts.visible(); }

  /** Altura mínima */
  @HostBinding('style.minHeight')
    get minHeight() { return this.ts.height(); }

  /** Sticky */
  @HostBinding('class.sticky')
    get stickyClass() { return this.ts.sticky(); }

  /** Locked */
  @HostBinding('class.locked')
    get lockedClass() { return this.ts.locked(); }

  /** Fondo y texto */
  @HostBinding('style.backgroundColor')
    get bg() { return this.ts.background(); }

  @HostBinding('style.color')
    get fg() { return this.ts.color(); }

  /** Elevación */
  @HostBinding('class.elevation-none')
    get eNone() { return this.ts.elevation() === 'none'; }
  @HostBinding('class.elevation-sm')
    get eSm()   { return this.ts.elevation() === 'sm'; }
  @HostBinding('class.elevation-md')
    get eMd()   { return this.ts.elevation() === 'md'; }
  @HostBinding('class.elevation-lg')
    get eLg()   { return this.ts.elevation() === 'lg'; }

  /** CSS var para align-items */
  @HostBinding('style.--vertical-align')
    get cssVert() { return this._cssVert; }
}
