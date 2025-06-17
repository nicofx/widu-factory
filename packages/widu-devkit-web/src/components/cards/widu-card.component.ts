import {
  Component,
  Input,
  Output,
  EventEmitter,
  HostBinding,
  HostListener,
  ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { BaseDynamicComponent, DynamicComponentService } from '../../services/dynamic';

@Component({
  selector: 'widu-card',
  standalone: true,
  imports: [CommonModule],
  providers: [DynamicComponentService<any, any>],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './widu-card.component.html'
})
export class WiduCardComponent extends BaseDynamicComponent<any, any> {
  /** Estilos Tailwind personalizables */
  @Input() bg = 'bg-white';
  @Input() textColor = 'text-gray-900';
  @Input() border = 'border border-gray-200';
  @Input() rounded = 'rounded-lg';
  @Input() shadow = 'shadow-sm';
  @Input() padding = 'p-4';
  @Input() hoverFeedback = false;
  @Input() glow = false;
  @Input() disabled = false;
  @Input() skeleton = false;
  @Input() selected = false;

  /** Evento click de la card */
  @Output() cardClick = new EventEmitter<void>();

  /** Calcula dinámicamente la clase completa */
  @HostBinding('class')
  get hostClasses(): string {
    return [
      'relative flex flex-col w-full overflow-hidden transition-all duration-200',
      this.bg,
      this.textColor,
      this.border,
      this.rounded,
      this.shadow,
      this.padding,
      this.hoverFeedback ? 'hover:scale-[1.01]' : '',
      this.glow ? 'hover:shadow-glow' : '',
      this.disabled ? 'opacity-50 pointer-events-none' : '',
      this.skeleton ? 'animate-pulse' : '',
      this.selected ? 'ring-2 ring-primary' : ''
    ]
      .filter(c => !!c)
      .join(' ');
  }

  /** Para accesibilidad: foco si no está disabled */
  @HostBinding('attr.tabindex')
  get tabindex(): number {
    return this.disabled ? -1 : 0;
  }

  /** Si hay observadores, exposé role=button */
  @HostBinding('attr.role')
  get role(): string | null {
    return this.cardClick.observers.length ? 'button' : null;
  }

  @HostListener('click')
  onClick() {
    if (!this.disabled) this.cardClick.emit();
  }

  @HostListener('keydown.enter')
  onEnter() {
    if (!this.disabled) this.cardClick.emit();
  }

  @HostListener('keydown.space')
  onSpace() {
    if (!this.disabled) this.cardClick.emit();
  }
}
