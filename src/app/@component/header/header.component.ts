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

  constructor(private router: Router) { }
  currentTab: string = ''; // 記錄目前在哪一頁

  ngOnInit(): void {
    // window.location.pathname這段是抓網址路徑
    // 要抓路徑第一個字之後(因為開頭是/).slice(1)
    this.currentTab = window.location.pathname.slice(1);
  }

  menuAdmin() {
    this.currentTab = 'menuAdmin';
    this.router.navigateByUrl('menuAdmin');
  }

  reservation() {
    this.currentTab = 'reserve';
    this.router.navigateByUrl('reserve');
  }

  table() {
    this.currentTab = 'table';
    this.router.navigateByUrl('table');
  }

  order() {
    this.currentTab = 'order-page';
    this.router.navigateByUrl('order-page');
  }

  mealStatus() {
    this.currentTab = 'meal/status';
    this.router.navigateByUrl('meal/status');
  }

  workstation() {
    this.currentTab = 'workstation';
    this.router.navigateByUrl('workstation');
  }

  calander() {
    this.currentTab = 'calendar';
    this.router.navigateByUrl('calendar');
  }
}
