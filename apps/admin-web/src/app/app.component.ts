import { Component, } from '@angular/core';
import { MenuItem, SidePanelComponent, SidePanelService,  } from '@widu/devkit-web';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SidePanelComponent, ]
})
export class AppComponent {
  constructor(public sp: SidePanelService) {}

    sideMenu: MenuItem[] = [
    { label: 'Dashboard' },
    {
      label: 'Usuarios',
      children: [
        { label: 'Listado' },
        { label: 'Alta' }
      ]
    }
  ];

}
