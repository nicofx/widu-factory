// packages/widu-devkit/src/lib/navigation/widget/widget.model.ts

import { TemplateRef } from '@angular/core';

export type WidgetLayout = 'card' | 'inline' | 'compact';
export type WidgetStyle = 'neutral' | 'info' | 'success' | 'warning' | 'danger';
export interface WidgetAction {
  label: string;
  icon?: string;
  command: () => void;
}

export interface WidgetConfig {
  title?: string;
  icon?: string;
  badge?: string | number;
  actions?: WidgetAction[];
  // Si preferís pasar un TemplateRef en lugar de content string:
  contentTemplate?: TemplateRef<any>;
  contentText?: string;
  layout?: WidgetLayout;
  style?: WidgetStyle;
}
