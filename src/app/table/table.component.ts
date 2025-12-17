import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, WorkTable, Order, BasicRes, WorkTableListRes, Rect, Reservation, ReservationListTodayRes, ReservationNowList, ReservationNowListRes, ReservationToday, Table, TableRes, UpdateReservation } from '../@service/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableEditComponent } from './tableEdit/tableEdit';
import { catchError, min, of } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';



@Component({
  selector: 'app-table',
  imports: [MatProgressBarModule, FormsModule, MatIconModule],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  readonly dialog = inject(MatDialog);

  constructor(private service: DataService) { }

  @ViewChild('canvas', { static: true }) canvasRef!: ElementRef<HTMLCanvasElement>;
  ctx!: CanvasRenderingContext2D;

  tableList!: Table[];
  admin!: boolean;
  isEdit!: boolean;
  isResize!: boolean;
  editTable!: Table;
  oldX!: number;
  oldY!: number;
  timerId!: any;
  reservationList!: ReservationNowList[];
  reservationListToday!: ReservationToday[];
  searchRes!: Reservation[];
  reservation!: Reservation[];
  currentTime!: string;
  reservation_date!: string;
  timeList = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  inputSearch!: string;
  len = [0, 100, 200, 300, 400, 500];
  mouseDownTime!: any;
  mouseUpTime!: any;

  cornerSize = 10;
  rects!: Rect[];

  activeRect: Rect | null = null;
  draggingCorner: string | null = null;
  draggingWholeRect = false;

  offsetX = 0;
  offsetY = 0;


  ngOnInit() {
    this.admin = true;
    //初始進入呼叫方法 顯示 第一次畫面
    this.screenRefreshMinute();

    //每分鐘重新更新畫面資訊 搭配ngOnDestroy()
    this.timerId = setInterval(() => {
      this.screenRefreshMinute();
    }, 60000); // 每60秒執行一次
  }

  ngAfterViewInit() {
    this.ctx = this.canvasRef.nativeElement.getContext('2d')!;
  }


  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }


  // 報到按鈕
  arrive(tableId: string, name: string, phone: string,
    childSeat: number, adultCount: number, childCount: number,
    note: string, time: string, personCount: number) {

    console.log(tableId);
    console.log(phone);
    console.log(name);
    console.log(childSeat);

    //開啟是否確認報到畫面
    const dialogRef = this.dialog.open(DialogComponent, {
      data: { message: "是否確定報到", flag: false },
      width: 'auto',
      height: 'auto'
    });

    //畫面結束後執行res 結果 true / false 若true則代表確認報到
    dialogRef.afterClosed().subscribe(res => {
      //確認報到則執行更新訂位資訊
      if (res) {
        let url = "reservation/update";
        let updateRes: UpdateReservation = {
          reservationDate: this.reservation_date,
          reservationPhone: phone,
          reservationTime: time,
          reservationName: name,
          reservationCount: personCount,
          reservationAdultCount: adultCount,
          reservationChildCount: childCount,
          reservationStatus: res,
          reservationNote: note,
          childSeat: childSeat,
          tableId: tableId,
          newDate: this.reservation_date
        };
        console.log(updateRes);
        //執行更新訂位資訊api
        this.service.postApi(url, updateRes).subscribe((res: BasicRes) => {
          //更新訂位資訊結束後執行查詢當日訂位api
          if (res.code == 200) {
            url = "reservation/date_list?reservationDate=" + this.reservation_date;
            this.service.getApi(url).subscribe((reservationListRes: ReservationListTodayRes) => {
              this.reservationListToday = reservationListRes.reservationAndTableByDateList;
              this.screenRefreshMinute();
            })
          }
        })
      }
    })
  }

  //即時搜尋功能 手機號碼/姓名
  search() {
    // console.log(this.inputSearch)
    console.log(this.reservationListToday[1])
    if (this.inputSearch) {
      this.searchRes = [];
      for (const reservation of this.reservation) {
        if (reservation.reservationName.includes(this.inputSearch)) {
          this.searchRes.push(reservation);
        }
        if (reservation.reservationPhone.includes(this.inputSearch)) {
          this.searchRes.push(reservation);
        }
      }
    }
    console.log(this.searchRes)
  }


  drawByStatus(rect: Rect, color: string) {
    const ctx = this.ctx;
    ctx.strokeRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = color
    ctx.fillRect(rect.x, rect.y, rect.w, rect.h);
    ctx.fillStyle = 'black'
    let str = rect.tableId
    ctx.fillText(str, rect.x + rect.w / 2, rect.y + rect.h / 2 - 10)
    str = rect.capacity + "人";
    ctx.fillText(str, rect.x + rect.w / 2, rect.y + rect.h / 2)
    if (rect.reservationName) {
      ctx.fillText(rect.reservationName, rect.x + rect.w / 2, rect.y + rect.h / 2 + 10)
    }
  }

  draw() {
    const ctx = this.ctx;
    ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);

    for (const rect of this.rects) {
      // ctx.strokeStyle = rect.selected ? 'black' : 'gray';
      ctx.strokeStyle = 'black';
      ctx.textAlign = 'center';
      // ctx.textBaseline = 'middle'
      ctx.lineWidth = 5;
      if (rect.status == "可預約") {
        this.drawByStatus(rect, "green");
      } else if (rect.status == "使用中") {
        this.drawByStatus(rect, "red");
      } else if (rect.status == "已預約") {
        this.drawByStatus(rect, "yellow");
      } else {
        this.drawByStatus(rect, "gray");
      }



      // ctx.fillText(str, rect.x + rect.w / 2, rect.y + rect.h / 2 + 10)
      // selected rectangle shows corner handles
      // if (rect.selected) {
      //   ctx.fillStyle = 'red';
      //   this.getCorners(rect).forEach(c => {
      //     ctx.fillRect(
      //       c.x - this.cornerSize / 2,
      //       c.y - this.cornerSize / 2,
      //       this.cornerSize,
      //       this.cornerSize
      //     );
      //   });
      // }

    }
  }

  getCorners(rect: Rect) {
    return [
      // { name: 'tl', x: rect.x, y: rect.y },
      // { name: 'tr', x: rect.x + rect.w, y: rect.y },
      // { name: 'bl', x: rect.x, y: rect.y + rect.h },
      { name: 'br', x: rect.x + rect.w, y: rect.y + rect.h },
    ];
  }

  // ================= Mouse Events =================
  handleDown(event: MouseEvent) {

    const { offsetX, offsetY } = event;
    if (!this.rects) {
      return
    }

    // 清除選取
    // this.rects.forEach(r => r.selected = false);
    // this.activeRect = null;

    // 1. 先檢查是否按到某個矩形的 corner
    for (const rect of [...this.rects].reverse()) {
      const corner = this.getCorners(rect).find(c =>
        Math.abs(offsetX - c.x) < this.cornerSize &&
        Math.abs(offsetY - c.y) < this.cornerSize
      );

      if (corner) {
        for (const table of this.tableList) {
          if (table.tableId == rect.tableId) {
            this.editTable = table;
            this.isResize = true;
            rect.selected = true;
            this.activeRect = rect;
            this.draggingCorner = corner.name;
            this.draw();
            return;
          }
        }
      }
    }


    for (const rect of this.rects) {
      if (offsetX < rect.x + rect.w && offsetX > rect.x &&
        offsetY < rect.y + rect.h && offsetY > rect.y) {
        for (const table of this.tableList) {
          if (table.tableId == rect.tableId) {
            this.editTable = table;
            this.isEdit = true;
            rect.selected = true;
            this.activeRect = rect;
            console.log(this.activeRect)
            this.mouseDownTime = new Date().getTime();
            this.draggingWholeRect = true;
            this.offsetX = offsetX - rect.x;
            this.offsetY = offsetY - rect.y;
            this.draw();
            return;
          }
        }
      }
    }

    // 2. 再檢查是否按到矩形本體 → 移動矩形
    // for (const rect of [...this.rects].reverse()) {
    //   if (
    //     offsetX >= rect.x && offsetX <= rect.x + rect.w &&
    //     offsetY >= rect.y && offsetY <= rect.y + rect.h
    //   ) {
    //     rect.selected = true;
    //     this.activeRect = rect;
    //     this.draggingWholeRect = true;
    //     this.offsetX = offsetX - rect.x;
    //     this.offsetY = offsetY - rect.y;
    //     this.draw();
    //     return;
    //   }
    // }

    // this.draw();

  }

  click(event: MouseEvent) {
    if (this.isEdit && this.mouseUpTime - this.mouseDownTime < 100) {
      console.log(this.editTable)
      const dialogRef = this.dialog.open(TableEditComponent, {
        data: {
          tableInfo: {
            tableId: this.editTable.tableId,
            tableStatus: this.editTable.tableStatus,
            tableCapacity: this.editTable.tableCapacity,
            tablePositionX: this.editTable.tablePositionX,
            tablePositionY: this.editTable.tablePositionY,
            lengthX: this.editTable.lengthX,
            lengthY: this.editTable.lengthY
          }, flag: false, mod: "編輯"
        },
        width: 'auto',
        height: 'auto'
      });
      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          this.screenRefreshMinute();
        }
        this.isEdit = false;
      })
    }
    if (!this.isEdit && !this.isResize) {
      const rect = this.canvasRef.nativeElement.getBoundingClientRect();
      const dialogRef = this.dialog.open(TableEditComponent, {
        data: { flag: false, mod: "新增" },
        width: 'auto',
        height: 'auto'
      });
      dialogRef.afterClosed().subscribe((res: any) => {
        if (res) {
          this.screenRefreshMinute();
        }
      })
    }

  }

  handleMove(event: MouseEvent) {
    if (!this.rects) {
      return;
    }
    const { offsetX, offsetY } = event;
    for (const rect of this.rects) {
      if (offsetX >= rect.x && offsetX <= rect.x + rect.w &&
        offsetY >= rect.y && offsetY <= rect.y + rect.h) {
        this.canvasRef.nativeElement.style.cursor = 'pointer'
        break;
      } else if (offsetX < rect.x + rect.w + 5 && offsetX > rect.x + rect.w - 5 &&
        offsetY < rect.y + rect.h + 5 && offsetY > rect.y + rect.h - 5) {
        this.canvasRef.nativeElement.style.cursor = 'nwse-resize'
        break;
      }
      else {
        this.canvasRef.nativeElement.style.cursor = 'default'
      }
    }
    if (!this.activeRect) {
      return;
    }




    // ------------- 拖曳角落（縮放）-------------
    if (this.draggingCorner) {
      const r = this.activeRect;
      if (offsetX > r.x && offsetY > r.y) {
        r.w = offsetX - r.x;
        r.h = offsetY - r.y;
      }


      // switch (this.draggingCorner) {
      // case 'tl':
      //   r.w += r.x - offsetX;
      //   r.h += r.y - offsetY;
      //   r.x = offsetX;
      //   r.y = offsetY;
      //   break;
      // case 'tr':
      //   r.w = offsetX - r.x;
      //   r.h += r.y - offsetY;
      //   r.y = offsetY;
      //   break;
      // case 'bl':
      //   r.w += r.x - offsetX;
      //   r.x = offsetX;
      //   r.h = offsetY - r.y;
      //   break;
      // case 'br':
      //   r.w = offsetX - r.x;
      //   r.h = offsetY - r.y;
      //   break;
      // }

      this.draw();
      return;
    }

    // ------------- 拖曳整個矩形（移動）-------------
    if (this.draggingWholeRect) {
      if (this.activeRect.x + this.activeRect.w <= this.canvasRef.nativeElement.width &&
        this.activeRect.y + this.activeRect.h <= this.canvasRef.nativeElement.height) {
        this.activeRect.x = offsetX - this.offsetX;
        this.activeRect.y = offsetY - this.offsetY;
        this.draw();
      }

    }

  }

  handleUp() {
    this.mouseUpTime = new Date().getTime();
    if (this.isEdit && this.mouseUpTime - this.mouseDownTime > 100) {
      let url = "table/update";
      for (const rect of this.rects) {
        if (rect.tableId == this.editTable.tableId) {
          this.editTable.tablePositionX = rect.x;
          this.editTable.tablePositionY = rect.y;
          this.service.postApi(url, this.editTable).subscribe((res: BasicRes) => {
            console.log(res);
            if (res.code == 200) {
              // this.screenRefreshMinute();
            } else {
              this.dialog.open(DialogComponent, {
                data: { message: res.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
              this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
              this.screenRefreshMinute();
            }
            this.isEdit = false;
            this.draggingCorner = null;
            this.draggingWholeRect = false;
            return;
          })
        }
      }
    }
    if (this.isResize) {
      let url = "table/update";
      for (const rect of this.rects) {
        if (rect.tableId == this.editTable.tableId) {
          this.editTable.lengthX = rect.w;
          this.editTable.lengthY = rect.h;
          this.service.postApi(url, this.editTable).subscribe((res: BasicRes) => {
            if (res.code == 200) {

            } else {
              this.dialog.open(DialogComponent, {
                data: { message: res.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
              this.ctx.clearRect(0, 0, this.canvasRef.nativeElement.width, this.canvasRef.nativeElement.height);
              this.screenRefreshMinute();
            }
            console.log(res);
            this.isResize = false;
            this.draggingCorner = null;
            this.draggingWholeRect = false;
            return;
          })
        }
      }
    }
    this.draggingCorner = null;
    this.draggingWholeRect = false;
  }


  // edit(flag: boolean) {
  // this.admin = flag;
  // let url = "table/list";
  // this.service.getApi(url).subscribe((res: any) => {
  //   this.draw();
  // })
  // }

  screenRefreshMinute() {
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let hour = String(today.getHours()).padStart(2, '0');
    let minute = String(today.getMinutes()).padStart(2, '0');
    this.currentTime = hour + ":" + minute;
    console.log(this.currentTime)
    this.reservation_date = `${year}-${month}-${day}`;

    let myDiv = document.getElementById("progressBar") as HTMLDivElement;

    let nowTime = this.currentTime.split(':').map(Number);
    let nowHour = nowTime[0] * 3600;
    let nowMinute = nowTime[1] * 60;

    if (nowHour + nowMinute >= 36000) {
      let timePercent = (((nowHour + nowMinute - 36000) / 3600) / 12) * 100
      let str = timePercent + "%";
      console.log(str)
      myDiv.style.width = str;
    } else {
      myDiv.style.width = "0%"
    }
    let url = "reservation/date_list?reservationDate=" + this.reservation_date;
    this.service.getApi(url).subscribe((reservationListToday: ReservationListTodayRes) => {
      this.reservationListToday = reservationListToday.reservationAndTableByDateList;
      this.reservation = [];
      for (const table of reservationListToday.reservationAndTableByDateList) {
        for (const reservation of table.reservations) {
          reservation.tableId = table.tableId
          this.reservation.push(reservation)
        }
      }
      //=========gpt協助產生排序定位時間陣列=========
      const now = new Date();
      this.reservation.sort((a, b) => {
        const timeA = buildTodayTime(a.reservationTime);
        const timeB = buildTodayTime(b.reservationTime);

        const isAPast = timeA < now;
        const isBPast = timeB < now;

        // 未過期排前面
        if (isAPast && !isBPast) return 1;
        if (!isAPast && isBPast) return -1;

        // 同為過期或同為未過期 → 正常排序
        return timeA.getTime() - timeB.getTime();
      });

      function buildTodayTime(hms: string): Date {
        const [h, m, s] = hms.split(':').map(Number);
        const d = new Date();
        d.setHours(h, m, s, 0);
        return d;
      }
      //================
      console.log(this.reservation)
      console.log(this.reservationListToday)
    })

    url = "reservation/now_time_list";
    this.service.getApi(url).subscribe((reservation: ReservationNowListRes) => {
      url = "table/list"
      console.log(reservation)
      this.reservationList = reservation.reservationAndTableByTimeList;
      console.log(this.reservationList)
      this.service.getApi(url).subscribe((tableRes: TableRes) => {
        console.log(tableRes)
        this.rects = [];
        if (tableRes.tableList) {
          this.tableList = tableRes.tableList;
          for (let i = 0; i < tableRes.tableList.length; i++) {
            let reservationName;
            if (reservation.reservationAndTableByTimeList) {
              reservationName = reservation.reservationAndTableByTimeList[i].reservationName;
            }
            this.rects.push({
              x: tableRes.tableList[i].tablePositionX,
              y: tableRes.tableList[i].tablePositionY,
              w: tableRes.tableList[i].lengthX, h: tableRes.tableList[i].lengthY,
              tableId: this.tableList[i].tableId,
              capacity: tableRes.tableList[i].tableCapacity,
              reservationName: reservationName,
              status: tableRes.tableList[i].tableStatus
            })
          }
          console.log(this.rects)
          this.draw();
        }
      })
    })



  }


  // 已預約 可預約 使用中 未開放




}

