import { CommonModule } from '@angular/common';
import { Component, HostListener, signal } from '@angular/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { Dialog } from '../dialog/dialog';
import { DeliveryTask, Http } from '../@service/http';
import { MapDelivery } from '../map-delivery/map-delivery';

@Component({
  selector: 'app-frontpage',
  imports: [MatExpansionModule, CommonModule, RouterOutlet, RouterLinkActive, RouterLink, MapDelivery],
  templateUrl: './frontpage.html',
  styleUrl: './frontpage.scss',

})
export class Frontpage {
  name = '';
  phone = '';
  userId: number = 0;

  //是否是手機版 測試用
  isMobile = false;
  menuOpen = false;

  //更改狀態顯示文字
  statusTextMap: Record<string, string> = {
  pending: '待取餐',
  pickup: '配送中',
  completed: '已完成',
};

  items = signal<DeliveryTask[]>([]);
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
     // 這裡先塞假資料
       // 每 5 秒刷新已接單列表
  setInterval(() => {
    this.fetchAvailableTasks();
  }, 10000);

  }

 // 取得已接單列表
fetchTakingTasks() {
  this.httpService.getTakingTasks(this.userId).subscribe({
    next: (res) => {
      let tasks = res.dtaskList ?? [];

      // 過濾今天的訂單
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      tasks = tasks.filter(task => task.date === today);

      tasks.forEach((item, index) => {
        // 假商品資料
        item.products = [
          { name: "炸雞", price: 70, options: ["大辣"] },
          { name: "薯條", price: 40, options: ["大份"] }
        ];
        item.totalPrice = 110;

        // 假地址
        const fakeAddresses = [
           '高雄市前鎮區興漁四路7號',

           '高雄市前鎮區民權二路76號',
            '高雄市前鎮區復興四路12號',
           '高雄市前鎮區復興四路10號',


        ];
        item.customerAddress = fakeAddresses[index % fakeAddresses.length];

        // 預設 estimatedTime
        if (item.estimatedTime === undefined) item.estimatedTime = 0;
      });

      this.items.set(tasks);
    },
    error: (err) => {
      console.error('取得已接單錯誤', err);
    }
  });
}


  // 取得可接單列表
  fetchAvailableTasks() {
  this.httpService.getAvailableTasks().subscribe({
    next: (res) => {
      let available = res.dtaskList ?? [];

      // 過濾今天的訂單
      const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
      available = available.filter(task => task.date === today);

      available.forEach((item, index) => {
        item.products = [
          { name: "炸雞", price: 70, options: ["大辣"] },
          { name: "薯條", price: 40, options: ["大份"] }
        ];
        item.totalPrice = 110;

        const fakeAddresses = [
            '高雄市前鎮區興漁四路7號',
             '高雄市前鎮區民權二路76號',
            '高雄市前鎮區復興四路12號',

           '高雄市前鎮區復興四路10號',
        ];
        item.customerAddress = fakeAddresses[index % fakeAddresses.length];

        if (item.estimatedTime === undefined) item.estimatedTime = 0;
      });

      this.bottomItems = available.filter(
        task => !this.items().some(i => i.orderNo === task.orderNo)
      );
    }
  });
}


  // 接單
  addToTop(item: DeliveryTask) {
    if (this.items().length >= 3) {
      this.openDialog('最多只能選 3 個！');
      return;
    }

    this.httpService.takeOrder(item.orderNo, this.userId).subscribe({
      next: (res) => {
        if (res.code === 200) {
          // 預設 estimatedTime 避免 undefined
          if (item.estimatedTime === undefined) item.estimatedTime = 0;

          this.items.update(list => [...list, item]);
          this.bottomItems = this.bottomItems.filter(i => i.orderNo !== item.orderNo);
        } else {
          this.openDialog('接單失敗: ' + res.message);
        }
      },
      error: (err) => {
        console.error(err);
        this.openDialog('接單錯誤');
      }
    });
  }

  // 標記已取餐
  markPickedUp(item: DeliveryTask) {
    const estimatedTime = item.estimatedTime ?? 0;
    console.log('準備送到後端的資料:', {
    orderNo: item.orderNo,
    status: 'pickup',
    estimatedTime
  });

    this.httpService.updateStatus(item.orderNo, 'pickup', estimatedTime).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.items.update(list =>
            list.map(i => i.orderNo === item.orderNo ? { ...i, status: 'pickup' } : i)
          );
        } else {
          this.openDialog('更新取餐狀態失敗: ' + res.message);
        }
      },
      error: (err) => {
        console.error('更新取餐狀態錯誤', err);
        this.openDialog('更新取餐狀態錯誤');
      }
    });
  }

  // 標記已送達
  markDelivered(item: DeliveryTask) {
    this.httpService.updateStatus(item.orderNo, 'completed', 0).subscribe({
      next: (res) => {
        if (res.code === 200) {
          this.items.update(list =>
            list.filter(i => i.orderNo !== item.orderNo)
          );
        } else {
          this.openDialog('更新取餐狀態失敗: ' + res.message);
        }
      },
      error: (err) => {
        console.error('更新取餐狀態錯誤', err);
        this.openDialog('更新取餐狀態錯誤');
      }
    });
  }

  // 登出
  Signout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }

  openDialog(message: string): void {
    this.dialog.open(Dialog, { data: { message } });
  }

  // 更新距離與費用
  updateItemDistance(event: { orderNo: string, distanceKm: number, money: number }) {
    this.items.update(list =>
      list.map(item =>
        item.orderNo === event.orderNo
          ? { ...item, distanceKm: event.distanceKm, money: event.money }
          : item
      )
    );
  }

  //手機測試
  @HostListener('window:resize')
checkDevice() {
  this.isMobile = window.innerWidth <= 768;
}



}
