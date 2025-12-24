import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../dialog/dialog';
import { DeliveryTask, Http } from '../@service/http';
import { MapDelivery } from '../map-delivery/map-delivery';
import { MatIcon } from "@angular/material/icon";



@Component({
  selector: 'app-frontpage',
  imports: [MatExpansionModule, CommonModule, RouterOutlet, RouterLinkActive, RouterLink, MapDelivery, MatIcon],
  templateUrl: './frontpage.html',
  styleUrl: './frontpage.scss',

})
export class Frontpage {
   name = '';
  phone = '';
  userId: number = 0;

  // 手機判斷
  isMobile = false;
  menuOpen = false;

  // 狀態文字
  statusTextMap: Record<string, string> = {
    pending: '待取餐',
    pickup: '配送中',
    completed: '已完成',
  };

  // 已接單（signal）
  items = signal<DeliveryTask[]>([]);

  // 可接單
  bottomItems: DeliveryTask[] = [];

  constructor(
    private router: Router,
    private httpService: Http,
    private dialog: MatDialog
  ) {}

  ngOnInit() {
    const storedId = localStorage.getItem('userId');
    const phone = localStorage.getItem('phone');

    if (!storedId || !phone) {
      alert('錯誤，請重新登入');
      this.router.navigate(['/login']);
      return;
    }

    this.userId = Number(storedId);
    this.name = localStorage.getItem('name') ?? '';
    this.phone = phone;

    this.fetchTakingTasks();
    this.fetchAvailableTasks();

    // 每 10 秒刷新可接單
    setInterval(() => {
      this.fetchAvailableTasks();
    }, 10000);
  }

  // ================= 已接單 =================
  fetchTakingTasks() {
    this.httpService.getTakingTasks(this.userId).subscribe({
      next: (res) => {
        let tasks = res.dtaskList ?? [];

        const today = new Date().toISOString().split('T')[0];
        tasks = tasks.filter(task => task.date === today);

        // 只做最小初始化（❌ 不塞假資料）
        tasks.forEach(item => {
          if (item.estimatedTime === undefined) item.estimatedTime = 0;
          item.products = [];
        });

        this.items.set(tasks);
      },
      error: (err) => {
        console.error('取得已接單錯誤', err);
      }
    });
  }

  // ================= 可接單 =================
  updateBottomItemDistance(event: {
  orderNo: string;
  distanceKm: number;
  money: number;
}) {
  this.bottomItems = this.bottomItems.map(item =>
    item.orderNo === event.orderNo
      ? {
          ...item,
          distanceKm: event.distanceKm,
          money: event.money,
          calculated: true // ⭐ 關鍵：標記算過
        }
      : item
  );
}

  fetchAvailableTasks() {
  this.httpService.getAvailableTasks().subscribe({
    next: (res) => {
      let available = res.dtaskList ?? [];

      const today = new Date().toISOString().split('T')[0];
      available = available.filter(task => task.date === today);

      this.bottomItems = available
        .filter(task => !this.items().some(i => i.orderNo === task.orderNo))
        .map(task => {
          const old = this.bottomItems.find(b => b.orderNo === task.orderNo);
          return old ? old : {
            ...task,
            products: [],
            calculated: false
          };
        });
    }
  });
}


  // ================= 展開時抓訂單詳細 =================
 loadOrderDetail(item: DeliveryTask) {
  if (item.products && item.products.length > 0) return;

  console.log('loading details for', item.orderNo);

  this.httpService.getOrderDetailByCode(item.orderNo).subscribe({
    next: (res) => {
      console.log('order detail response:', res);
      const products = res.orderDetailsList.flatMap(od =>
        od.orderDetails.map(p => ({
          name: p.productName,
          price: 0,
          options: p.detailList?.map(d => d.option) ?? []
        }))
      );

      // 更新已接單
      this.items.update(list =>
        list.map(i =>
          i.orderNo === item.orderNo
            ? { ...i, products, customerAddress: res.customerAddress, totalPrice: res.totalPrice }
            : i
        )
      );

      // 更新可接單
      this.bottomItems = this.bottomItems.map(i =>
        i.orderNo === item.orderNo
          ? { ...i, products, customerAddress: res.customerAddress, totalPrice: res.totalPrice }
          : i
      );
    },
    error: (err) => console.error('取得訂單詳細失敗', err)
  });
}





  // ================= 接單 =================
  addToTop(item: DeliveryTask) {
    if (this.items().length >= 3) {
      this.openDialog('最多只能選 3 個！');
      return;
    }

    this.httpService.takeOrder(item.orderNo, this.userId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          if (item.estimatedTime === undefined) item.estimatedTime = 0;

          this.items.update(list => [...list, item]);
          this.bottomItems = this.bottomItems.filter(i => i.orderNo !== item.orderNo);
        } else {
          this.openDialog('接單失敗: ' + res.message);
        }
      },
      error: () => {
        this.openDialog('接單錯誤');
      }
    });
  }

  // ================= 已取餐 =================
  markPickedUp(item: DeliveryTask) {
    const estimatedTime = item.estimatedTime ?? 0;

    this.httpService.updateStatus(item.orderNo, 'pickup', estimatedTime).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.items.update(list =>
            list.map(i =>
              i.orderNo === item.orderNo ? { ...i, status: 'pickup' } : i
            )
          );
        } else {
          this.openDialog('更新取餐狀態失敗');
        }
      },
      error: () => {
        this.openDialog('更新取餐狀態錯誤');
      }
    });
  }

  // ================= 已送達 =================
  markDelivered(item: DeliveryTask) {
    this.httpService.updateStatus(item.orderNo, 'completed', 0).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.items.update(list =>
            list.filter(i => i.orderNo !== item.orderNo)
          );
        } else {
          this.openDialog('更新送達狀態失敗');
        }
      },
      error: () => {
        this.openDialog('更新送達狀態錯誤');
      }
    });
  }

  // ================= 更新距離與費用 =================
  updateItemDistance(event: { orderNo: string, distanceKm: number, money: number }) {
  this.items.update(list =>
    list.map(item =>
      item.orderNo === event.orderNo
        ? { ...item, distanceKm: event.distanceKm, money: event.money }
        : item
    )
  );
}


  // ================= 登出 =================
  Signout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openDialog(message: string): void {
    this.dialog.open(Dialog, { data:  {title: '提醒', message } });
  }

  // ================= 手機判斷 =================
  @HostListener('window:resize')
  checkDevice() {
    this.isMobile = window.innerWidth <= 768;
  }
}
