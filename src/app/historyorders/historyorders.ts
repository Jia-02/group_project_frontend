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
import { MatIcon } from "@angular/material/icon";
@Component({
  selector: 'app-historyorders',
  imports: [MatExpansionModule, RouterLink, RouterLinkActive, RouterOutlet, FormsModule,
    MatExpansionModule,
    MatDatepickerModule,
    MatFormFieldModule,
    MatInputModule, MatIcon],
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

  this.loadAllOrders();
}


 loadAllOrders() {
    this.http.getAllByDeliveryid(this.deliveryId).subscribe(res => {
      if (res.code === 200 && res.dtaskList) {
        this.items = res.dtaskList.map(item => ({
          ...item,
          products: [],
          totalPrice: 0
        }));
      } else {
        this.items = [];
      }
    });
  }

  loadOrderDetail(item: DeliveryTask) {
    if (item.products.length > 0) return;

    this.http.getOrderDetailByCode(item.orderNo).subscribe({
      next: (res) => {
        const products = res.orderDetailsList.flatMap(od =>
          od.orderDetails.map(p => ({
            name: p.productName,
            price: 0,
            options: p.detailList?.map(d => d.option) ?? []
          }))
        );

        item.products = products;
        item.totalPrice = res.totalPrice;
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
