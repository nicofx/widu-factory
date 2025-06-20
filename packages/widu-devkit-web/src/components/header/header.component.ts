import {
  Component,
  Input,
  HostBinding
} from '@angular/core';
import { CommonModule }    from '@angular/common';
import { HeaderService }   from './header.service';
import { ViewportService } from '@widu/devkit-web';

@Component({
  selector: 'widu-header',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent {
  constructor(
    public header: HeaderService,
    private vp: ViewportService   // para detectar mobile/desktop
  ) {}

  // ─── Inputs que actualizan el HeaderService ─────────────────

  @Input() set height(v: string)       
    { this.header.setHeight(v); }

  @Input('zones') set zonesInput(v: ('left'|'center'|'right')[]) 
    { this.header.setZones(v); }

  @Input('subtitleLines') set subtitleLinesInput(v: 1|2)   
    { this.header.setSubtitleLines(v); }

  @Input() set sticky(v: boolean)      
    { this.header.setSticky(v); }

  @Input() set locked(v: boolean)      
    { this.header.setLocked(v); }

  @Input() set background(v: string)   
    { this.header.setBackground(v); }

  @Input() set color(v: string)        
    { this.header.setColor(v); }

  @Input() set elevation(v: 'none'|'sm'|'md'|'lg') 
    { this.header.setElevation(v); }

  // ─── Nuevos Inputs: responsividad y alineación vertical ───

  /** Ocultar zonas en mobile (left/center/right) */
  @Input() hideOnMobile: {
    left?: boolean;
    center?: boolean;
    right?: boolean;
  } = {};

  /** Alineación vertical: top | center | bottom */
  @Input() set verticalAlign(v: 'top'|'center'|'bottom') {
    const map = { top: 'flex-start', center: 'center', bottom: 'flex-end' } as const;
    this._vertAlign = map[v] || map.center;
  }
  private _vertAlign = 'center';

  // ─── Lógica interna ───────────────────────────────────────

  /** Decide si se muestra la zona dada según viewport y hideOnMobile */
  zoneVisible(zone: 'left'|'center'|'right'): boolean {
    // 1) si la zona no está en el array de zones → ocultar
    if (!this.header.zones().includes(zone)) return false;
    // 2) si es mobile y hideOnMobile[zone]===true → ocultar
    if (this.vp.isMobile() && this.hideOnMobile[zone]) return false;
    // 3) en cualquier otro caso → mostrar
    return true;
  }

  // ─── HostBindings para estilos y clases en <widu-header> ────

  /** Altura mínima según input height */
  @HostBinding('style.minHeight')
    get minHeight()       { return this.header.height(); }

  /** Clase sticky si header.sticky() */
  @HostBinding('class.sticky')
    get stickyClass()     { return this.header.sticky(); }

  /** Clase locked si header.locked() */
  @HostBinding('class.locked')
    get lockedClass()     { return this.header.locked(); }

  /** Color de fondo */
  @HostBinding('style.backgroundColor')
    get bgColor()         { return this.header.background(); }

  /** Color de texto */
  @HostBinding('style.color')
    get fgColor()         { return this.header.color(); }

  /** Elevation classes */
  @HostBinding('class.elevation-none')
    get eNone()           { return this.header.elevation() === 'none'; }
  @HostBinding('class.elevation-sm')
    get eSm()             { return this.header.elevation() === 'sm'; }
  @HostBinding('class.elevation-md')
    get eMd()             { return this.header.elevation() === 'md'; }
  @HostBinding('class.elevation-lg')
    get eLg()             { return this.header.elevation() === 'lg'; }

  /** CSS var para align-items vertical de filas */
  @HostBinding('style.--vertical-align')
    get cssVertAlign()    { return this._vertAlign; }
}
