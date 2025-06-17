import { CommonModule } from '@angular/common';
import { Component, Input, ChangeDetectionStrategy } from '@angular/core';
import { WiduCardComponent } from '../widu-card.component';

@Component({
  selector: 'widu-card-media',
  standalone: true,
  imports: [CommonModule, WiduCardComponent],
  templateUrl: './widu-card-media.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduCardMediaComponent {
  @Input() id!: string;        // para el DynamicRegistry
  @Input() mediaSrc!: string;
  @Input() mediaAlt = '';
  @Input() title?: string;     // contenido header
  @Input() subtitle?: string;  // contenido header
  @Input() footer?: string;    // contenido footer
}
