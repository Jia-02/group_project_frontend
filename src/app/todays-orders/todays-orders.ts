import { Component, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { DeliveryTask, Http } from '../@service/http';
@Component({
  selector: 'app-todays-orders',
  imports: [MatExpansionModule,RouterLink, RouterLinkActive, RouterOutlet],
  templateUrl: './todays-orders.html',
  styleUrl: './todays-orders.scss',
})
export class TodaysOrders {

  name: string = '';
  phone: string = '';
  deliveryId: number = 0;

  constructor(
    private router: Router,
    private http: Http
  ) {}

  readonly panelOpenState = signal(false);

  items: DeliveryTask[] = [];

  ngOnInit() {
    const phone = localStorage.getItem('phone');
    const name = localStorage.getItem('name');
    const userId = localStorage.getItem('userId');

    if (!phone || !name|| !userId) {
      this.router.navigate(['/login']);
      alert("未登入");
      return;
    }

    this.phone = phone;
    this.name = name;
    this.deliveryId = Number(userId);

    this.loadTodayOrders();
  }

  //  取得今天日期 YYYY-MM-DD
  getToday(): string {
    const d = new Date();
    const y = d.getFullYear();
    const m = (d.getMonth() + 1).toString().padStart(2, '0');
    const day = d.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${day}`;
  }

  // 從後端載入今日完成訂單
  loadTodayOrders() {
  const today = this.getToday();

  this.http.getCompletedByDate(today, this.deliveryId).subscribe(res => {
    if (res.code === 200 && res.dtaskList) {
      // 抓到今天訂單後補假餐點
      this.items = res.dtaskList.map((item, index) => {
        // 假餐點
        item.products = [
          { name: "炸雞", price: 70, options: ["大辣"] },
          { name: "薯條", price: 40, options: ["大份"] }
        ];
        // 計算總價
        item.totalPrice = item.products.reduce((sum, p) => sum + p.price, 0);
        return item;
      });
    } else {
      this.items = [];
    }
  });
}


  //  登出
  Signout() {
    localStorage.removeItem('name');
    localStorage.removeItem('phone');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  //  總金額
  get totalMoney() {
    return this.items.reduce((sum, item) => sum + Number(item.money), 0);
  }
}
