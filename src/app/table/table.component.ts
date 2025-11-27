import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, Reservation, ReservationListRes, ReservationListTodayRes, ReservationToday, Table, TableRes } from '../data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableEditComponent } from './tableEdit/tableEdit';
import { catchError, min } from 'rxjs';
import { DialogComponent } from './dialog/dialog.component';
import { MatProgressBarModule } from '@angular/material/progress-bar';

@Component({
  selector: 'app-table',
  imports: [MatProgressBarModule],
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
  reservation_date!: string;
  timeList = [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];

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
    }



    console.log(this.reservation_date);

    if (this.admin) {
      let url = "http://localhost:8080/table/list";
      this.service.getApi(url).subscribe((table: TableRes) => {
        console.log(table)
        url = "http://localhost:8080/reservation/date_list?reservation_date=" + this.reservation_date;
        this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
          this.reservationList = res.reservationAndTableByDateList;
          console.log(this.reservationList);
          this.reBuild(table);
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
      }
      if (this.admin) {
        let url = "http://localhost:8080/table/list";
        this.service.getApi(url).subscribe((tableRes: TableRes) => {
          console.log(tableRes)
          let table = tableRes.tableList;
          url = "http://localhost:8080/reservation/date_list?reservation_date=" + this.reservation_date;
          this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
            this.reservationList = res.reservationAndTableByDateList;
            console.log(res);
            for (let i = 0; i < table.length; i++) {
              for (let j = 0; j < res.reservationAndTableByDateList.length; j++) {
                if (table[i].tableId == res.reservationAndTableByDateList[j].tableId && res.reservationAndTableByDateList[j].reservations.length > 0) {
                  for (let k = 0; k < res.reservationAndTableByDateList[j].reservations.length; k++) {
                    let resTime = res.reservationAndTableByDateList[j].reservations[k].reservationTime.split(':').map(Number);
                    let nowTime = this.currentTime.split(':').map(Number);
                    let nowHour = nowTime[0] * 3600;
                    let nowMinute = nowTime[1] * 60;
                    let resHour = resTime[0] * 3600;
                    let resMinute = resTime[1] * 60;
                    let resSecond = resTime[2];
                    let nowTotalSecond = nowHour + nowMinute;
                    let resTotalSecond = resHour + resMinute + resSecond;
                    if (resTotalSecond - nowTotalSecond <= 1800 && nowTotalSecond < resTotalSecond) {
                      if (res.reservationAndTableByDateList[j].reservations[k].reservationStatus) {
                        let url = "http://localhost:8080/table/update";
                        let updateTable: Table = {
                          tableId: table[i].tableId, tableStatus: "使用中", tableCapacity: table[i].tableCapacity,
                          tablePositionX: table[i].tablePositionX, tablePositionY: table[i].tablePositionY,
                          lengthX: table[i].lengthX, lengthY: table[i].lengthY
                        }
                        this.service.postApi(url, updateTable).pipe(
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
                      } else {
                        let url = "http://localhost:8080/table/update";
                        let updateTable: Table = {
                          tableId: table[i].tableId, tableStatus: "已預約", tableCapacity: table[i].tableCapacity,
                          tablePositionX: table[i].tablePositionX, tablePositionY: table[i].tablePositionY,
                          lengthX: table[i].lengthX, lengthY: table[i].lengthY
                        }
                        this.service.postApi(url, updateTable).pipe(
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
                      }
                      break;
                    }
                    else if (table[i].tableStatus != "使用中") {
                      let url = "http://localhost:8080/table/update";
                      let updateTable: Table = {
                        tableId: table[i].tableId, tableStatus: "可預約", tableCapacity: table[i].tableCapacity,
                        tablePositionX: table[i].tablePositionX, tablePositionY: table[i].tablePositionY,
                        lengthX: table[i].lengthX, lengthY: table[i].lengthY
                      }
                      this.service.postApi(url, updateTable).pipe(
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
                    }
                    console.log(resTotalSecond - nowTotalSecond);
                  }
                }
                // else if (table[i].tableStatus != "使用中" && table[i].tableStatus != "已預約") {
                //   let url = "http://localhost:8080/table/update";
                //   let updateTable: Table = {
                //     tableId: table[i].tableId, tableStatus: "可預約", tableCapacity: table[i].tableCapacity,
                //     tablePositionX: table[i].tablePositionX, tablePositionY: table[i].tablePositionY,
                //     lengthX: table[i].lengthX, lengthY: table[i].lengthY
                //   }
                //   this.service.postApi(url, updateTable).pipe(
                //     catchError((error) => {
                //       if (error.error.code == 400) {
                //         this.dialog.open(DialogComponent, {
                //           data: { message: error.error.message, flag: true },
                //           width: 'auto',
                //           height: 'auto'
                //         });
                //       }
                //       return error;
                //     })).subscribe((res: any) => {
                //       console.log(res)
                //       if (res.code == 200) {
                //         url = "http://localhost:8080/table/list";
                //         this.service.getApi(url).subscribe((res: TableRes) => {
                //           console.log(res)
                //           console.log(res.tableList)
                //           this.reBuild(res);
                //         })
                //       } else {
                //         this.dialog.open(DialogComponent, {
                //           data: { message: res.message, flag: true },
                //           width: 'auto',
                //           height: 'auto'
                //         });
                //       }
                //     });
                // }
              }
            }
          })
          this.reBuild(tableRes);

        })
      }


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
    } else {
      if (this.isEdit) {
        let url = "http://localhost:8080/reservation/date_list?reservation_date=" + this.reservation_date;
        this.service.getApi(url).subscribe((res: ReservationListTodayRes) => {
          this.reservationList = res.reservationAndTableByDateList;
          for (let i = 0; i < this.reservationList.length; i++) {
            if (this.editTable.tableId == this.reservationList[i].tableId && this.reservationList[i].reservations.length > 0) {
              console.log(this.reservationList[i].reservations.length)
              const dialogRef = this.dialog.open(TableEditComponent, {
                data: { tableInfo: this.editTable, mod: "資訊" },
                width: 'auto',
                height: 'auto'
              });
              break;
            }
          }
        })
      }
    }


  }

  reBuild(res: TableRes) {
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    this.tableList = res.tableList;
    ctx.textAlign = 'center';
    // ctx.textBaseline = 'middle'
    ctx.lineWidth = 5;
    ctx.font = "15px serif";
    if (this.admin) {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < res.tableList.length; i++) {
        let str = "";
        if (res.tableList[i].tableStatus == "已預約") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(res.tableList[i].tablePositionX,
            res.tableList[i].tablePositionY, res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.fillStyle = 'yellow';
          ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 - 10)
          str = res.tableList[i].tableCapacity + "人";
          ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
          for (let j = 0; j < this.reservationList.length; j++) {
            for (let k = 0; k < this.reservationList[j].reservations.length; k++) {
              let resTime = this.reservationList[j].reservations[k].reservationTime.split(':').map(Number);
              let nowTime = this.currentTime.split(':').map(Number);
              let nowHour = nowTime[0] * 3600;
              let nowMinute = nowTime[1] * 60;
              let resHour = resTime[0] * 3600;
              let resMinute = resTime[1] * 60;
              let resSecond = resTime[2];
              let nowTotalSecond = nowHour + nowMinute;
              let resTotalSecond = resHour + resMinute + resSecond;
              if (resTotalSecond - nowTotalSecond <= 1800 && nowTotalSecond < resTotalSecond) {
                str = this.reservationList[j].reservations[k].reservationName
                ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
                  res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 30)
              }
            }
          }
        } else if (res.tableList[i].tableStatus == "可預約") {
          ctx.strokeStyle = 'black';
          ctx.strokeRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.fillStyle = 'gray';
          ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 - 10)
          str = res.tableList[i].tableCapacity + "人";
          ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
        } else if (res.tableList[i].tableStatus == "使用中") {
          ctx.strokeStyle = "black";
          ctx.strokeRect(res.tableList[i].tablePositionX,
            res.tableList[i].tablePositionY, res.tableList[i].lengthX, res.tableList[i].lengthY);
          ctx.fillStyle = 'red';
          ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
            res.tableList[i].lengthX, res.tableList[i].lengthY)
          ctx.fillStyle = 'black';
          ctx.fillText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 - 10)
          str = res.tableList[i].tableCapacity + "人";
          ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
            res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
          for (let j = 0; j < this.reservationList.length; j++) {
            for (let k = 0; k < this.reservationList[j].reservations.length; k++) {
              let resTime = this.reservationList[j].reservations[k].reservationTime.split(':').map(Number);
              let nowTime = this.currentTime.split(':').map(Number);
              let nowHour = nowTime[0] * 3600;
              let nowMinute = nowTime[1] * 60;
              let resHour = resTime[0] * 3600;
              let resMinute = resTime[1] * 60;
              let resSecond = resTime[2];
              let nowTotalSecond = nowHour + nowMinute;
              let resTotalSecond = resHour + resMinute + resSecond;
              if (resTotalSecond - nowTotalSecond <= 1800 && nowTotalSecond < resTotalSecond &&
                res.tableList[i].tableId == this.reservationList[j].tableId) {
                str = this.reservationList[j].reservations[k].reservationName
                ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
                  res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 30)
              } else if (nowTotalSecond > resTotalSecond && nowTotalSecond - nowTotalSecond <= 5400 &&
                res.tableList[i].tableId == this.reservationList[j].tableId) {
                str = this.reservationList[j].reservations[k].reservationName
                ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
                  res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 30)
              }
            }
          }
        }
      }
    } else {
      ctx.clearRect(0, 0, canvasElement.width, canvasElement.height);
      for (let i = 0; i < res.tableList.length; i++) {
        let str = "";
        ctx.strokeStyle = 'black';
        ctx.strokeRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
          res.tableList[i].lengthX, res.tableList[i].lengthY);
        ctx.fillStyle = 'gray';
        ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY,
          res.tableList[i].lengthX, res.tableList[i].lengthY)
        ctx.fillStyle = 'black';
        ctx.fillText(res.tableList[i].tableId, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
          res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 - 10)
        str = res.tableList[i].tableCapacity + "人";
        ctx.fillText(str, res.tableList[i].tablePositionX + res.tableList[i].lengthX / 2,
          res.tableList[i].tablePositionY + res.tableList[i].lengthY / 2 + 10)
      }
    }
  }

  // 已預約 可預約 使用中 未開放




}

