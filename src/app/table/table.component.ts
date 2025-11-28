import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, Reservation, ReservationListRes, ReservationListTodayRes, ReservationNowList, ReservationNowListRes, ReservationToday, Table, TableRes, UpdateReservation } from '../data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableEditComponent } from './tableEdit/tableEdit';
import { catchError, min } from 'rxjs';
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
  reservation!: Reservation;
  currentTime!: string;
  reservation_date!: string;
  timeList = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
  inputSearch!: string;
  len = [0,100,200,300,400,500];

  ngOnInit() {
    this.admin = true;
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
      myDiv.style.height = str;
    } else {
      myDiv.style.height = "0%"
    }

    console.log(this.reservation_date);

    if (this.admin) {
      let url = "http://localhost:8080/reservation/date_list?reservationDate=" + this.reservation_date;
      this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
        this.reservationListToday = res.reservationAndTableByDateList;
        console.log(this.reservationListToday)
      })
      url = "http://localhost:8080/reservation/now_time_list";
      this.service.getApi(url).subscribe((res: ReservationNowListRes) => {
        this.reservationList = res.reservationAndTableByTimeList;
        console.log(res.reservationAndTableByTimeList)
        url = "http://localhost:8080/table/list";
        this.service.getApi(url).subscribe((tableRes: TableRes) => {
          url = "http://localhost:8080/table/update";
          for (let i = 0; i < this.reservationList.length; i++) {
            console.log(tableRes.tableList[i])
            if (this.reservationList[i].tableDailyStatus) {
              let table: Table = {
                tableId: this.reservationList[i].tableId,
                tableStatus: this.reservationList[i].tableStatus,
                tableCapacity: tableRes.tableList[i].tableCapacity,
                tablePositionX: tableRes.tableList[i].tablePositionX,
                tablePositionY: tableRes.tableList[i].tablePositionY,
                lengthX: tableRes.tableList[i].lengthX,
                lengthY: tableRes.tableList[i].lengthY
              }
              this.service.postApi(url, table).subscribe((res: any) => {
                console.log(res);
              })
            }
          }
          url = "http://localhost:8080/table/list";
          this.service.getApi(url).subscribe((tableRes: TableRes) => {
            this.reBuild(tableRes);
          })
        })
      })
    }


    this.timerId = setInterval(() => {
      let today = new Date();
      let hour = String(today.getHours()).padStart(2, '0');
      let minute = String(today.getMinutes()).padStart(2, '0');
      let month = String(today.getMonth() + 1).padStart(2, '0');
      let day = String(today.getDate()).padStart(2, '0');
      this.reservation_date = `${year}-${month}-${day}`;
      this.currentTime = hour + ":" + minute;
      let nowTime = this.currentTime.split(':').map(Number);
      let nowHour = nowTime[0] * 3600;
      let nowMinute = nowTime[1] * 60;
      console.log(this.currentTime);

      if (nowHour + nowMinute >= 36000) {
        let timePercent = (((nowHour + nowMinute - 36000) / 3600) / 12) * 100
        let str = timePercent + "%";
        console.log(str)
        myDiv.style.height = str;
      } else {
        myDiv.style.height = "0%"
      }

      if (this.admin) {
        let url = "http://localhost:8080/reservation/now_time_list"
        this.service.getApi(url).subscribe((res: ReservationNowListRes) => {
          this.reservationList = res.reservationAndTableByTimeList;
          console.log(res.reservationAndTableByTimeList)
          url = "http://localhost:8080/table/list";
          this.service.getApi(url).subscribe((tableRes: TableRes) => {
            url = "http://localhost:8080/table/update";
            for (let i = 0; i < this.reservationList.length; i++) {
              console.log(tableRes.tableList[i])
              if (this.reservationList[i].tableDailyStatus) {
                let table: Table = {
                  tableId: this.reservationList[i].tableId,
                  tableStatus: this.reservationList[i].tableStatus,
                  tableCapacity: tableRes.tableList[i].tableCapacity,
                  tablePositionX: tableRes.tableList[i].tablePositionX,
                  tablePositionY: tableRes.tableList[i].tablePositionY,
                  lengthX: tableRes.tableList[i].lengthX,
                  lengthY: tableRes.tableList[i].lengthY
                }
                this.service.postApi(url, table).subscribe((res: any) => {
                  console.log(res);
                })
              }
            }
            url = "http://localhost:8080/table/list";
            this.service.getApi(url).subscribe((tableRes: TableRes) => {
              this.reBuild(tableRes);
            })
          })
        })
      }
    }, 60000); // 每60秒執行一次
  }

  ngOnDestroy() {
    if (this.timerId) {
      clearInterval(this.timerId);
    }
  }

  arrive(tableId: string, name: string, phone: string,
    childSeat: number, adultCount: number, childCount: number,
    note: string, time: string, personCount: number) {

    console.log(tableId);
    console.log(phone);
    console.log(name);
    console.log(childSeat);

    const dialogRef = this.dialog.open(DialogComponent, {
      data: { message: "是否確定報到", flag: false },
      width: 'auto',
      height: 'auto'
    });

    dialogRef.afterClosed().subscribe(res => {
      if (res) {
        let url = "http://localhost:8080/reservation/update";
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
        this.service.postApi(url, updateRes).subscribe((res: any) => {
          url = "http://localhost:8080/reservation/date_list?reservationDate=" + this.reservation_date;
          this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
            this.reservationListToday = res.reservationAndTableByDateList;
            console.log(this.reservationListToday)
          })
        })
      }
    })

  }

  search() {
    // console.log(this.inputSearch)
    this.searchRes = [];
    for (let i = 0; i < this.reservationListToday.length; i++) {
      if (this.reservationListToday[i].reservations.length > 0) {
        for (let j = 0; j < this.reservationListToday[i].reservations.length; j++) {
          if (this.reservationListToday[i].reservations[j].reservationName.includes(this.inputSearch)) {
            console.log(this.inputSearch)
            this.searchRes.push(this.reservationListToday[i].reservations[j])
          } else if (this.reservationListToday[i].reservations[j].reservationPhone.includes(this.inputSearch)) {
            this.searchRes.push(this.reservationListToday[i].reservations[j])
          }
        }
      }
    }
    console.log(this.searchRes)
  }

  @ViewChild('myCanvas') canvas!: ElementRef;


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
          this.isEdit = true;
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
    let nowTime = this.currentTime.split(':').map(Number);
    let nowHour = nowTime[0] * 3600;
    let nowMinute = nowTime[1] * 60;
    this.admin = flag;
    let url = "http://localhost:8080/table/list";
    this.service.getApi(url).subscribe((res: any) => {
      this.reBuild(res);
    })
  }

  handleOut(e: MouseEvent) {

    if (this.isResize) {
      const canvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');

      ctx.clearRect(0, 0, ctx.width, ctx.height);

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
        ctx.clearRect(this.editTable.tablePositionX - 5, this.editTable.tablePositionY - 5,
          x - this.editTable.tablePositionX + 20, y - this.editTable.tablePositionY + 20);
        ctx.strokeStyle = "black";
        ctx.strokeRect(this.editTable.tablePositionX, this.editTable.tablePositionY,
          x - this.editTable.tablePositionX, y - this.editTable.tablePositionY);
      }
    } else {
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
    }


  }

  reBuild(tableList: TableRes) {
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    this.tableList = tableList.tableList;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle'
    ctx.lineWidth = 5;
    ctx.font = "15px serif";
    if (this.admin) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < tableList.tableList.length; i++) {
        let str = "";
        if (tableList.tableList[i].tableStatus == "已預約") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(tableList.tableList[i].tablePositionX,
            tableList.tableList[i].tablePositionY, tableList.tableList[i].lengthX, tableList.tableList[i].lengthY);
          ctx.fillStyle = 'yellow';
          ctx.fillRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
            tableList.tableList[i].lengthX, tableList.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(tableList.tableList[i].tableId, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 - 10)
          str = tableList.tableList[i].tableCapacity + "人";
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
          str = this.reservationList[i].reservationName;
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 30);
        } else if (tableList.tableList[i].tableStatus == "可預約") {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
            tableList.tableList[i].lengthX, tableList.tableList[i].lengthY);
          ctx.fillStyle = 'green';
          ctx.fillRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
            tableList.tableList[i].lengthX, tableList.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(tableList.tableList[i].tableId, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 - 10)
          str = tableList.tableList[i].tableCapacity + "人";
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
        } else if (tableList.tableList[i].tableStatus == "使用中") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(tableList.tableList[i].tablePositionX,
            tableList.tableList[i].tablePositionY, tableList.tableList[i].lengthX, tableList.tableList[i].lengthY);
          ctx.fillStyle = 'red';
          ctx.fillRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
            tableList.tableList[i].lengthX, tableList.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(tableList.tableList[i].tableId, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 - 10)
          str = tableList.tableList[i].tableCapacity + "人";
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
          str = this.reservationList[i].reservationName;
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 30);
        } else if (tableList.tableList[i].tableStatus == "未開放") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(tableList.tableList[i].tablePositionX,
            tableList.tableList[i].tablePositionY, tableList.tableList[i].lengthX, tableList.tableList[i].lengthY);
          ctx.fillStyle = 'gray';
          ctx.fillRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
            tableList.tableList[i].lengthX, tableList.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(tableList.tableList[i].tableId, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 - 10)
          str = tableList.tableList[i].tableCapacity + "人";
          ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
            tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
        }
      }
    } else {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < tableList.tableList.length; i++) {
        let str = "";
        ctx.strokeStyle = 'black';
        ctx.strokeRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
          tableList.tableList[i].lengthX, tableList.tableList[i].lengthY);
        ctx.fillStyle = 'gray';
        ctx.fillRect(tableList.tableList[i].tablePositionX, tableList.tableList[i].tablePositionY,
          tableList.tableList[i].lengthX, tableList.tableList[i].lengthY)
        ctx.fillStyle = 'black';
        ctx.fillText(tableList.tableList[i].tableId, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
          tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 - 10)
        str = tableList.tableList[i].tableCapacity + "人";
        ctx.fillText(str, tableList.tableList[i].tablePositionX + tableList.tableList[i].lengthX / 2,
          tableList.tableList[i].tablePositionY + tableList.tableList[i].lengthY / 2 + 10)
      }
    }
  }

  // 已預約 可預約 使用中 未開放




}

