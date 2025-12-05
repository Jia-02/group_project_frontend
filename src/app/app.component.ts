import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent {
  title = 'GroupProject';

  ngOnInit(): void {

  }

}

// angular.json設定
// "options": {
//   "host": "0.0.0.0",
//   "disableHostCheck": true
// }
