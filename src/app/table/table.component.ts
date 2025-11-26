import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, Reservation, ReservationListRes, ReservationListTodayRes, ReservationToday, Table, TableRes } from '../data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableEditComponent } from './tableEdit/tableEdit';
import { catchError, min } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  readonly dialog = inject(MatDialog);

  constructor(private service: DataService) { }

  tableList!: Table[];
  admin!: boolean;
  isEdit!: boolean;
  isResize!: boolean;
  editTable!: Table;
  oldX!: number;
  oldY!: number;
  timerId!: any;
  reservationList!: ReservationToday[];
  reservation!: Reservation;
  currentTime!: string;

  ngOnInit() {
    this.admin = true;
    let today = new Date();
    let year = today.getFullYear();
    let month = String(today.getMonth() + 1).padStart(2, '0');
    let day = String(today.getDate()).padStart(2, '0');
    let hour = String(today.getHours()).padStart(2,'0');
    let minute = String(today.getMinutes()).padStart(2,'0');
    this.currentTime = hour + ":" + minute;
    console.log(this.currentTime)
    let reservation_date = `${year}-${month}-${day}`;

    console.log(reservation_date);

    if (this.admin) {
      let url = "http://localhost:8080/table/list";
      this.service.getApi(url).subscribe((res: TableRes) => {
        console.log(res)
        this.reBuild(res);
      })
    }
    let url = "http://localhost:8080/reservation/date_list?reservation_date=" + reservation_date;
    this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
      this.reservationList = res.reservationAndTableByDateList;
      console.log(this.reservationList);
    })

    this.timerId = setInterval(() => {
      let today = new Date();
      let hour = String(today.getHours()).padStart(2,'0');
      let minute = String(today.getMinutes()).padStart(2,'0');
      this.currentTime = hour + ":" + minute;
      console.log(this.currentTime);
      if (this.admin) {
        let url = "http://localhost:8080/table/list";
        this.service.getApi(url).subscribe((res: TableRes) => {
          console.log(res)
          this.reBuild(res);
        })
      }

      let url = "http://localhost:8080/reservation/date_list?reservation_date=" + reservation_date;
      this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
        console.log(res);
      })
    }, 60000); // 每60秒執行一次
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  @ViewChild('myCanvas') canvas!: ElementRef;

  //每次進入畫面將存在資料庫內的所有桌位資料撈出並顯示在canvas上面


  handlePress(e: MouseEvent) {
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    const rect = canvasElement.getBoundingClientRect()
    this.isEdit = false;

    //x為滑鼠點擊時畫布中的x軸座標位置 y同上為y軸位置
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;


    if (!this.admin) {
      setTimeout(() => {
        for (let i = 0; i < this.tableList.length; i++) {
          if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + this.tableList[i].lengthX - 1) >= x &&
            this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + this.tableList[i].lengthY - 1) >= y) {
            this.isEdit = true;
            this.editTable = this.tableList[i];
            break;
          } else if (x <= (this.tableList[i].tablePositionX + this.tableList[i].lengthX + 5) &&
            x > (this.tableList[i].tablePositionX + this.tableList[i].lengthX - 1) &&
            y <= (this.tableList[i].tablePositionY + this.tableList[i].lengthY + 5) &&
            y > (this.tableList[i].lengthY - 1)) {
            this.isResize = true;
            this.editTable = this.tableList[i];
            canvasElement.style.cursor = 'nwse-resize'
            break;
          }
          else {
            this.isResize = false;
            this.isEdit = false;
          }
        }
      }, 100);
    } else {
      for (let i = 0; i < this.tableList.length; i++) {
        if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + this.tableList[i].lengthX - 1) >= x &&
          this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + this.tableList[i].lengthY - 1) >= y) {
          this.editTable = this.tableList[i];
          break;
        }
        else {
          this.isResize = false;
          this.isEdit = false;
        }
      }
    }




  }

  edit(flag: boolean) {
    this.admin = flag;
    let url = "http://localhost:8080/table/list";
    this.service.getApi(url).subscribe((res: TableRes) => {
      console.log(res)
      this.reBuild(res);
      console.log(this.admin)
    })
  }

  handleOut(e: MouseEvent) {

    if (this.isResize) {
      const canvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');

      ctx.clearRect(0, 0, 500, 500);

      let url = "http://localhost:8080/table/list";
      this.service.getApi(url).subscribe((res: TableRes) => {
        console.log(res)
        this.reBuild(res);
      })
    }

    this.isEdit = false;
    this.isResize = false;

  }

  handleMove(e: MouseEvent) {


    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    const rect = canvasElement.getBoundingClientRect()

    //x為滑鼠在畫布中的x軸座標位置 y同上為y軸位置
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (this.isResize) {
      if (x > this.editTable.tablePositionX && y > this.editTable.tablePositionY) {
        ctx.clearRect(this.editTable.tablePositionX - 1, this.editTable.tablePositionY - 1,
          x - this.editTable.tablePositionX + 10, y - this.editTable.tablePositionY + 10);
        // ctx.clearText(this.editTable.tablePositionX - 1, this.editTable.tablePositionY - 1, x - this.editTable.tablePositionX + 20, y - this.editTable.tablePositionY + 20);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.editTable.tablePositionX, this.editTable.tablePositionY,
          x - this.editTable.tablePositionX, y - this.editTable.tablePositionY);
        // ctx.strokeStyle = 'green';
        // ctx.strokeText(this.editTable.tableStatus, this.editTable.tablePositionX + this.editTable.lengthX / 2,
        //   this.editTable.tablePositionY + this.editTable.lengthY / 2)
      }
    }

    for (let i = 0; i < this.tableList.length; i++) {
      if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + this.tableList[i].lengthX - 1) >= x &&
        this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + this.tableList[i].lengthY - 1) >= y) {
        canvasElement.style.cursor = 'pointer'
        break;
      } else if (x <= (this.tableList[i].tablePositionX + this.tableList[i].lengthX + 5) &&
        x > (this.tableList[i].tablePositionX + this.tableList[i].lengthX - 5) &&
        y <= (this.tableList[i].tablePositionY + this.tableList[i].lengthY + 5) &&
        y > (this.tableList[i].tablePositionY + this.tableList[i].lengthY - 5) && !this.admin) {
        canvasElement.style.cursor = 'nwse-resize'
        break;
      }
      else {
        canvasElement.style.cursor = 'default'
      }
    }






  }

  handleUp(e: MouseEvent) {

  }

  //監聽滑鼠點擊事件
  handleClick(e: MouseEvent) {
    console.log(e.clientX, e.clientY)
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    const rect = canvasElement.getBoundingClientRect()

    //x為滑鼠點擊時畫布中的x軸座標位置 y同上為y軸位置
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;

    if (!this.admin) {
      //flag為判斷該次滑鼠點擊的位置是否已有桌位 若有桌位則為false 如下行for迴圈中 #1處
      let flag = true;
      if (this.isEdit) {
        let url = "http://localhost:8080/table/update";
        let table: Table = {
          tableId: this.editTable.tableId, tableStatus: this.editTable.tableStatus, tableCapacity: this.editTable.tableCapacity,
          tablePositionX: x, tablePositionY: y, lengthX: this.editTable.lengthX, lengthY: this.editTable.lengthY
        }
        console.log(table);
        this.service.postApi(url, table).pipe(
          catchError((error) => {
            if (error.error.code == 400) {
              this.dialog.open(DialogComponent, {
                data: { message: error.error.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
            }
            return error;
          })).subscribe((res: any) => {
            console.log(res)
            if (res.code == 200) {
              url = "http://localhost:8080/table/list";
              this.service.getApi(url).subscribe((res: TableRes) => {
                console.log(res)

                // 重置畫布
                ctx.reset();

                console.log(res.tableList)
                this.reBuild(res);
              })
            } else {
              this.dialog.open(DialogComponent, {
                data: { message: res.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
            }
          });
      } else if (this.isResize) {
        let url = "http://localhost:8080/table/update";
        let table: Table = {
          tableId: this.editTable.tableId, tableStatus: this.editTable.tableStatus, tableCapacity: this.editTable.tableCapacity,
          tablePositionX: this.editTable.tablePositionX, tablePositionY: this.editTable.tablePositionY,
          lengthX: x - this.editTable.tablePositionX, lengthY: y - this.editTable.tablePositionY
        }
        this.service.postApi(url, table).pipe(
          catchError((error) => {
            if (error.error.code == 400) {
              this.dialog.open(DialogComponent, {
                data: { message: error.error.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
            }
            return error;
          })).subscribe((res: any) => {
            console.log(res)
            if (res.code == 200) {
              url = "http://localhost:8080/table/list";
              this.service.getApi(url).subscribe((res: TableRes) => {
                console.log(res)

                // 重置畫布
                ctx.reset();

                console.log(res.tableList)
                this.reBuild(res);
              })
            } else {
              const dialogRef = this.dialog.open(DialogComponent, {
                data: { message: res.message, flag: true },
                width: 'auto',
                height: 'auto'
              });

              dialogRef.afterClosed().subscribe(res => {
                let url = "http://localhost:8080/table/list";
                this.service.getApi(url).subscribe((res: TableRes) => {
                  console.log(res)
                  ctx.reset();
                  console.log(res.tableList)
                  this.reBuild(res);
                })

              })

            }
          });
      }
      else {
        // for迴圈遍歷資料庫中所有table的資訊
        for (let i = 0; i < this.tableList.length; i++) {
          // 由於預設畫布桌位大小為 20*20 px 的範圍 所以去判斷 滑鼠點擊時的點是否有涵蓋到已存在中的桌位
          if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + this.tableList[i].lengthX) >= x &&
            this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + this.tableList[i].lengthY) >= y) {

            // #1 滑鼠點擊處已有存在table則將flag值更改為false
            flag = false;

            // 由於滑鼠點擊到的 座標 已有存在的桌位 則已編輯桌位狀態 開啟dialog
            const dialogRef = this.dialog.open(TableEditComponent, {
              data: { tableInfo: this.tableList[i], mod: "編輯" },
              width: 'auto',
              height: 'auto'
            });


            dialogRef.afterClosed().subscribe(res => {
              let url = "http://localhost:8080/table/list";

              // 編輯結束後去判斷 res 是否為 true 若為 true 代表有進行 刪除/更新 的動作
              if (res) {

                // 由於有對資料庫table資料進行 更新/刪除 需重新獲取資料庫中的所有table資料
                this.service.getApi(url).subscribe((res: TableRes) => {
                  console.log(res)
                  // 重置畫布
                  ctx.reset();

                  //重新渲染畫布 將資料庫中所有table資料 撈出 並跑for迴圈顯示在畫布上

                  console.log(res.tableList)
                  this.reBuild(res);
                })
              }
            })
          }
        }

        // flag 為true 時 代表點擊的點沒有涵蓋在存在的table中
        if (flag) {

          // 因為沒有涵蓋在存在的table中所已進行 新增table
          const dialogRef = this.dialog.open(TableEditComponent, {
            // data為 table 欄位的預設資料 可進行修改
            data: { status: "可預約", capacity: 2, position_x: x, position_y: y, mod: "新增" },
            width: 'auto',
            height: 'auto'
          });

          // dialog結束後 判斷 res是否為 true 若為 true 代表有新增table
          dialogRef.afterClosed().subscribe(res => {
            let url = "http://localhost:8080/table/list";

            // res為true 代表新增table 則需重新獲取資料庫中的table資訊並顯示在畫布上
            if (res) {
              this.service.getApi(url).subscribe((res: TableRes) => {
                console.log(res)
                this.reBuild(res);
              })
            }
          })
        }
      }

      this.isResize = false;
      this.isEdit = false;
    } else {
      const dialogRef = this.dialog.open(TableEditComponent, {
        data: { tableInfo: this.editTable, mod: "資訊" },
        width: 'auto',
        height: 'auto'
      });

    }


  }

  reBuild(res: TableRes) {
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    this.tableList = res.tableList;
    if (this.admin) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < res.tableList.length; i++) {
        let str = "";
        if (res.tableList[i].tableStatus == "已預約") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(res.tableList[i].tablePositionX,
            res.tableList[i].tablePositionY, res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.strokeStyle = 'red';
          str = res.tableList[i].tableId + res.tableList[i].tableCapacity;
          ctx.strokeText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2)
        } else if (res.tableList[i].tableStatus == "可預約") {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.strokeStyle = 'green';
          ctx.strokeText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2)
          str = res.tableList[i].tableCapacity + "人";
          ctx.strokeText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
        }
      }
    } else {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < res.tableList.length; i++) {
        let str = "";
        if (res.tableList[i].tableStatus == "已預約") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(res.tableList[i].tablePositionX,
            res.tableList[i].tablePositionY, res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.strokeStyle = 'red';
          str = res.tableList[i].tableId + res.tableList[i].tableCapacity;
          ctx.strokeText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2)
        } else if (res.tableList[i].tableStatus == "可預約") {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.strokeStyle = 'green';
          ctx.strokeText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2)
          str = res.tableList[i].tableCapacity + "人";
          ctx.strokeText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
        }
      }
    }
  }

  // 已預約 可預約 使用中 未開放




}


function moment(arg0: any): any {
  throw new Error('Function not implemented.');
}

