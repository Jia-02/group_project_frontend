import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, Table, TableRes } from '../data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { TableEditComponent } from './tableEdit/tableEdit';

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

  @ViewChild('myCanvas') canvas!: ElementRef;

  //每次進入畫面將存在資料庫內的所有桌位資料撈出並顯示在canvas上面
  ngOnInit(): void {

    let url = "http://localhost:8080/table/list";
    this.service.getApi(url).subscribe((res: TableRes) => {
      console.log(res)
      const canvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');
      this.tableList = res.tableList;
      for (let i = 0; i < res.tableList.length; i++) {
        ctx.fillStyle = 'red';
        ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY, 20, 20);
      }
    })

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

    //flag為判斷該次滑鼠點擊的位置是否已有桌位 若有桌位則為false 如下行for迴圈中 #1處
    let flag = true;

    // for迴圈遍歷資料庫中所有table的資訊
    for (let i = 0; i < this.tableList.length; i++) {
      // 由於預設畫布桌位大小為 20*20 px 的範圍 所以去判斷 滑鼠點擊時的點是否有涵蓋到已存在中的桌位
      if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + 20) >= x &&
        this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + 20) >= y) {

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
              const canvasElement = this.canvas.nativeElement;
              const ctx = canvasElement.getContext('2d');

              // 重置畫布
              ctx.reset();

              //重新渲染畫布 將資料庫中所有table資料 撈出 並跑for迴圈顯示在畫布上
              this.tableList = res.tableList;
              console.log(res.tableList)
              for (let i = 0; i < res.tableList.length; i++) {
                ctx.fillStyle = 'red';
                ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY, 20, 20);
              }
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
        data: { status: "空位", capacity: 2, position_x: x, position_y: y, mod: "新增" },
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
            const canvasElement = this.canvas.nativeElement;
            const ctx = canvasElement.getContext('2d');
            this.tableList = res.tableList;
            for (let i = 0; i < res.tableList.length; i++) {
              ctx.fillStyle = 'red';
              ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY, 20, 20);
            }
          })
        }
      })
    }
  }


}


