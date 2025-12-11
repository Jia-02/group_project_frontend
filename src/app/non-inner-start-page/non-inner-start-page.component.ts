import { Component } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-non-inner-start-page',
  imports: [],
  templateUrl: './non-inner-start-page.component.html',
  styleUrl: './non-inner-start-page.component.scss'
})
export class NonInnerStartPageComponent {
  constructor(private router: Router) {}

  takeOut() {
    // 導航到顧客資訊頁，並使用**查詢參數**傳遞訂單類型
    this.router.navigate(['/customer-information'], { queryParams: { ordersType: 'T' } });
  }

  delivery() {
    // 導航到顧客資訊頁，並使用**查詢參數**傳遞訂單類型
    this.router.navigate(['/customer-information'], { queryParams: { ordersType: 'D' } });
  }
}
