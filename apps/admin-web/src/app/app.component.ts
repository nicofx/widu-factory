import { Component, } from '@angular/core';
import { HeaderComponent, SidePanelComponent, SidePanelService, ToolbarComponent, ToolbarService,  } from '@widu/devkit-web';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SidePanelComponent, HeaderComponent, ToolbarComponent]
})
export class AppComponent {
  constructor(private toolbar: ToolbarService) {}


  // Handler del toggle
  onToolbarToggled(visible: boolean) {
    console.log('Toolbar visible?', visible);
  }

    sideMenu: any[] = [
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
