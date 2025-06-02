import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WiduDummyComponent } from '@widu/devkit-web';
import { UserProfileDto } from '@widu/common-models';


@Component({
  selector: 'app-root',
  standalone: true,
  imports: [WiduDummyComponent],
  template: `
  <h1>App Angular desde WiduFactory 🚀 {{testUser.name}}</h1>
  <widu-dummy></widu-dummy>
  `,
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
