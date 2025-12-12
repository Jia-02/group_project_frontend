import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  imports: [
    MatIconModule
  ],
  templateUrl: './header.component.html',
  styleUrl: './header.component.scss'
})
export class HeaderComponent {

  constructor(private router: Router){}

  menu() {

  }

  menuAdmin() {
    this.router.navigateByUrl('reserve');
  }

  reservation() {
    this.router.navigateByUrl('menuAdmin');
  }

  table() {

  }


  order() {

  }

  workStation() {

  }

  calander() {

  }
}
