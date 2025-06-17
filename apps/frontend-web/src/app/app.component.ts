import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WiduDummyComponent, WiduCardComponent } from '@widu/devkit-web';
import { UserProfileDto } from '@widu/common-models';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WiduDummyComponent, WiduCardComponent],
  templateUrl: './app.component.html',
})
export class AppComponent {
  title = 'frontend-web';

  testUser: UserProfileDto = {
    id: '123',
    name: 'Nico',
    email: 'nico@widu.dev',
    roles: ['admin', 'user']
  };

}
