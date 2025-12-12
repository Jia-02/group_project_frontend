import { Component } from '@angular/core';
import { NavigationStart, Router, RouterOutlet } from '@angular/router';
import { HeaderComponent } from './@component/header/header.component';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent,
    CommonModule
],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GroupProject';

  showHeader = true;
  constructor(private router:Router){
    router.events.forEach((event) => {
      if (event instanceof NavigationStart) {
        if (event['url'] == '/meal/status/user') {
          this.showHeader = false;
        } else {
          // console.log("NU")
          this.showHeader = true;
        }
      }
    });
  }



}

// angular.json設定
// "options": {
//   "host": "0.0.0.0",
//   "disableHostCheck": true
// }
