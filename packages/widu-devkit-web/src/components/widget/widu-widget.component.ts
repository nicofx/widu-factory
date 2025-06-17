import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ChangeDetectionStrategy,
  effect
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { signal, computed } from '@angular/core';
import { WidgetAction, WidgetLayout, WidgetStyle } from './widget.model';
import { withContext } from '../../services/context/wid-context.mixin';

@Component({
  selector: 'widu-widget',
  templateUrl: './widu-widget.component.html',
  styleUrls: ['./widu-widget.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: true,
  imports: [CommonModule]                                        // ✅ necesario
})
export class WiduWidgetComponent
  extends withContext(class {})
  implements OnChanges
{
  /* ---------- Inputs ---------- */
  @Input() title?: string;
  @Input() icon?: string;
  @Input() badge?: string | number;
  @Input() actions?: WidgetAction[];
  @Input() contentTemplate?: TemplateRef<any>;
  @Input() contentText?: string;
  @Input() layout: WidgetLayout = 'card';
  @Input() style: WidgetStyle = 'neutral';

  /** Clave principal en AppContext */
  @Input() ctxKey?: string;


  /* ---------- Signals internas ---------- */
  readonly titleSig           = signal<string | undefined>(undefined);
  readonly iconSig            = signal<string | undefined>(undefined);
  readonly badgeSig           = signal<string | number | undefined>(undefined);
  readonly actionsSig         = signal<WidgetAction[]>([]);
  readonly contentTemplateSig = signal<TemplateRef<any> | undefined>(undefined);
  readonly contentTextSig     = signal<string | undefined>(undefined);
  readonly layoutSig          = signal<WidgetLayout>('card');
  readonly styleSig           = signal<WidgetStyle>('neutral');

  readonly hostClasses = computed(() =>
    ['widu-widget', `layout-${this.layoutSig()}`, `style-${this.styleSig()}`].join(' ')
  );

  readonly badgeDisplay = computed(() => {
    const b = this.badgeSig();
    return b != null ? String(b) : '';
  });

  /* ---------- Life-cycle ---------- */
  ngOnChanges(ch: SimpleChanges): void {
    if (ch['title'])           this.titleSig.set(this.title);
    if (ch['icon'])            this.iconSig.set(this.icon);
    if (ch['badge'])           this.badgeSig.set(this.badge);
    if (ch['actions'])         this.actionsSig.set(this.actions ?? []);
    if (ch['contentTemplate']) this.contentTemplateSig.set(this.contentTemplate);
    if (ch['contentText'])     this.contentTextSig.set(this.contentText);
    if (ch['layout'])          this.layoutSig.set(this.layout);
    if (ch['style'])           this.styleSig.set(this.style);
  }

  constructor() {
    super();

    /* ctxKey binding → actualiza título o badge */
    effect(() => {
      if (!this.ctxKey) return;
      const val = this.readCtx<any>(this.ctxKey)();
      if (typeof val === 'string')  this.titleSig.set(val);
      if (typeof val === 'number')  this.badgeSig.set(val);
    });
  }

  /* ---------- Output ---------- */
  @Output() widgetClick = new EventEmitter<void>();
  onHostClick() { this.widgetClick.emit(); }
}
