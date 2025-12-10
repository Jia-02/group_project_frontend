import { Component } from '@angular/core';

@Component({
  selector: 'app-non-inner-start-page',
  imports: [],
  templateUrl: './non-inner-start-page.component.html',
  styleUrl: './non-inner-start-page.component.scss'
})
export class NonInnerStartPageComponent {
  takeOut() {
    // 外帶 (Takeout) - 附加參數 ?ordersType=T
    window.location.href = '/customer-information?ordersType=T';
  }

  delivery() {
    // 外送 (Delivery) - 附加參數 ?ordersType=D
    window.location.href = '/customer-information?ordersType=D';
  }
}
