import { Component, } from '@angular/core';
import { SidePanelComponent, SidePanelService,  } from '@widu/devkit-web';
@Component({
  standalone: true,
  selector: 'app-root',
  templateUrl: './app.component.html',
  imports: [SidePanelComponent, ]
})
export class AppComponent {
  constructor(public sp: SidePanelService) {}

}
