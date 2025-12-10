import { Component } from '@angular/core';

@Component({
  selector: 'app-inner-start-page',
  imports: [],
  templateUrl: './inner-start-page.component.html',
  styleUrl: './inner-start-page.component.scss'
})
export class InnerStartPageComponent {
  // 桌號抓table的qrcode的資料，之後會包在傳出訂單時到send-order-dialog
}
