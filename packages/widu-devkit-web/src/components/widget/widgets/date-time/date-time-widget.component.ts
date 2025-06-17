// packages/widu-devkit/src/lib/widgets/date-time/date-time-widget.component.ts

import { Component, effect, signal } from '@angular/core';
import { WiduWidgetModule } from '../../widu-widget.module';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'date-time-widget',
  template: `
    <widu-widget
      [title]="'Fecha y Hora'"
      [icon]="'pi pi-clock'"
      [style]="'info'"
      [layout]="'card'"
      [contentText]="dateTimeSig()"
    />
  `,
  standalone: true,
  imports: [CommonModule, WiduWidgetModule],
})
export class DateTimeWidgetComponent {
  readonly dateTimeSig = signal(this.formatDate(new Date()));

  constructor() {
    setInterval(() => {
      this.dateTimeSig.set(this.formatDate(new Date()));
    }, 1000);
  }

  private formatDate(d: Date): string {
    return d.toLocaleString('es-AR', {
      dateStyle: 'full',
      timeStyle: 'medium',
    });
  }
}
