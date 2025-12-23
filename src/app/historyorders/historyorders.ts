import { Component ,signal} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../dialog/dialog';
import { DeliveryTask, Http } from '../@service/http';
@Component({
  selector: 'app-historyorders',
  imports: [MatExpansionModule,RouterLink, RouterLinkActive, RouterOutlet ,FormsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule,],
  templateUrl: './historyorders.html',
  styleUrl: './historyorders.scss',
})
export class Historyorders {
 phone: string = "";
  name: string = "";
  deliveryId: number = 0;

  constructor(private router: Router, private http: Http,private dialog: MatDialog) {}

  readonly panelOpenState = signal(false);

  // ✔ 改成從資料庫來
  itemsOriginal: DeliveryTask[] = [];
  items: DeliveryTask[] = [];

  selectedDate: any = null;
  startDate: any = null;
  endDate: any = null;

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

  this.loadCompletedOrders();
}



//  itemsOriginal = [
//   { title: '訂單編號1', summary: '距離4km', money: '60', date: '2025-11-20', content: '餐點明細：- 經典牛肉漢堡 x2 - 可樂 x1 總價：$300 備註：請少糖', status: 'pickedUp' },
//   { title: '訂單編號2', summary: '距離3km', money: '55', date: '2025-11-21', content: '餐點明細：- 雞腿便當 x1 - 綠茶 x1 總價：$250 備註：不要辣', status: 'pickedUp' },
//   { title: '訂單編號3', summary: '距離5km', money: '70', date: '2025-11-22', content: '餐點明細：- 義大利麵 x1 - 檸檬水 x1 總價：$280 備註：少冰', status: 'pickedUp' },
//   { title: '訂單編號4', summary: '距離2km', money: '50', date: '2025-11-24', content: '餐點明細：- 拉麵 x1 - 冰紅茶 x1 總價：$230 備註：湯少一點', status: 'pickedUp' },
//   { title: '訂單編號5', summary: '距離6km', money: '75', date: '2025-11-23', content: '餐點明細：- 豬排便當 x1 - 奶茶 x1 總價：$310 備註：不要辣', status: 'pickedUp' },
//   { title: '訂單編號6', summary: '距離3.5km', money: '65', date: '2025-11-20', content: '餐點明細：- 牛肉炒飯 x1 - 綠茶 x1 總價：$270 備註：少油', status: 'pickedUp' },
//   { title: '訂單編號7', summary: '距離4.2km', money: '68', date: '2025-11-21', content: '餐點明細：- 咖哩雞飯 x1 - 可樂 x1 總價：$290 備註：不要辣', status: 'pickedUp' },
//   { title: '訂單編號8', summary: '距離2.8km', money: '55', date: '2025-11-22', content: '餐點明細：- 義大利麵 x1 - 檸檬水 x1 總價：$260 備註：少冰', status: 'pickedUp' },
//   { title: '訂單編號9', summary: '距離5.5km', money: '80', date: '2025-11-23', content: '餐點明細：- 魚排便當 x1 - 紅茶 x1 總價：$320 備註：加辣', status: 'pickedUp' },
//   { title: '訂單編號10', summary: '距離3km', money: '60', date: '2025-11-24', content: '餐點明細：- 雞腿便當 x1 - 可樂 x1 總價：$250 備註：少鹽', status: 'pickedUp' }
// ];

loadCompletedOrders() {
  this.http.getAllByDeliveryid(this.deliveryId).subscribe(res => {
    console.log("歷史訂單 API 回傳：", res);

    if (res.code === 200 && res.dtaskList) {
      this.itemsOriginal = res.dtaskList.map((item, index) => {
        // 補上假商品資料
        item.products = [
          { name: "炸雞", price: 70, options: ["大辣"] },
          { name: "薯條", price: 40, options: ["大份"] }
        ];
        item.totalPrice = item.products.reduce((sum, p) => sum + p.price, 0);

        // 補上假地址
        const fakeAddresses = [
          "高雄市苓雅區四維三路2號",
          "高雄市前鎮區中華五路789號"
        ];
        item.customerAddress = fakeAddresses[index % fakeAddresses.length];

        // 預設 estimatedTime
        if (item.estimatedTime === undefined) item.estimatedTime = 0;

        return item;
      });

      this.items = [...this.itemsOriginal];
    } else {
      this.itemsOriginal = [];
      this.items = [];
    }
  });
}


  // 單日搜尋
  filterBySingleDate(event: any) {
    const pickedDate = event.value;
    if (!pickedDate) return;

    const dateStr = this.formatDate(pickedDate);
    this.items = this.itemsOriginal.filter(item => item.date === dateStr);
  }

  // 區間搜尋
  filterByRange() {
    if (!this.startDate || !this.endDate) return;
    if(this.startDate > this.endDate){
      this.openDialog('開始時間不能小於結束時間');
      this.items = [...this.itemsOriginal];
    this.selectedDate = null;
    this.startDate = null;
    this.endDate = null;
      return
    }
    const start = this.formatDate(new Date(this.startDate));
    const end = this.formatDate(new Date(this.endDate));

    this.items = this.itemsOriginal.filter(
      item => item.date >= start && item.date <= end
    );
  }

  resetFilter() {
    this.items = [...this.itemsOriginal];
    this.selectedDate = null;
    this.startDate = null;
    this.endDate = null;
  }

  // 日期格式化
  formatDate(date: Date): string {
    const y = date.getFullYear();
    const m = (date.getMonth() + 1).toString().padStart(2, '0');
    const d = date.getDate().toString().padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  Signout() {
    localStorage.removeItem('name');
    localStorage.removeItem('phone');
    localStorage.removeItem('userId');
    this.router.navigate(['/login']);
  }

  // 計算總金額
  get totalMoney() {
    return this.items.reduce((sum, item) => sum + Number(item.money), 0);
  }


  openDialog(message: string): void {
      this.dialog.open(Dialog, {
        data: { message } // 將訊息傳遞給 DialogComponent
      });
    }


}
