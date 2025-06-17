// import { TemplateRef } from '@angular/core';

// export interface SidebarItem {
//   id: string;
//   label: string;
//   icon?: string;
//   route?: string;
//   children?: SidebarItem[];
//   disabled?: boolean;
//   command?: () => void;
//   badge?: string | number;
// }

// export interface SidebarConfig {
//   collapsed?: boolean;
//   showToggle?: boolean;
// }

// /** Widget que se incrusta en la sidebar */
// export interface SidebarWidget {
//   id: string;
//   template: TemplateRef<any>;
// }

export interface MenuItem {
  label: string;
  icon?: string;            // clase de ícono o URL
  children?: MenuItem[];    // submenú en acordeón
}
