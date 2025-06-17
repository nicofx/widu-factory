import { Component, Input, ChangeDetectionStrategy, TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { WiduCardComponent } from '../widu-card.component';

@Component({
  selector: 'widu-card-list',
  standalone: true,
  imports: [CommonModule, WiduCardComponent],
  templateUrl: './widu-card-list.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WiduCardListComponent<T = any> {
  @Input() id!: string;
  @Input() items: T[] = [];
  @Input() itemTpl!: TemplateRef<{ $implicit: T }>;
}
