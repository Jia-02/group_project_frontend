import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './@component/header/header.component';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GroupProject';

  ngOnInit(): void {

  }

}

// angular.json設定，75行追加
// "options": {
//   "host": "0.0.0.0",
//   "disableHostCheck": true
// }
