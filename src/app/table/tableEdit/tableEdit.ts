import { Component, ErrorHandler, inject } from '@angular/core';
import { DataService, Table } from '../../data/data.service';
import { MAT_DIALOG_DATA, MatDialog, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { DialogComponent } from '../dialog/dialog.component';
import { catchError, throwError } from 'rxjs';

@Component({
  selector: 'app-add-table',
  imports: [FormsModule],
  templateUrl: './tableEdit.html',
  styleUrl: './tableEdit.scss'
})

export class TableEditComponent {


  readonly dialogRef = inject(MatDialogRef<TableEditComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  constructor(private service: DataService) { }

  readonly dialog = inject(MatDialog);

  tableId!: string;
  tableStatus!: string;
  tableCapacity!: number;
  tablePositionX!: number;
  tablePositionY!: number;

  ngOnInit(): void {

    // 如果data.tableInfo有值代表這次執行為編輯 需將存在中的table資訊assign給宣告的變數
    if (this.data.tableInfo) {
      this.tableId = this.data.tableInfo.tableId;
      this.tableStatus = this.data.tableInfo.tableStatus;
      this.tableCapacity = this.data.tableInfo.tableCapacity;
      this.tablePositionX = this.data.tableInfo.tablePositionX;
      this.tablePositionY = this.data.tableInfo.tablePositionY;
    }
    //若沒有值代表這次執行狀態為新增 將預設的table各個參數assign給宣告的變數
    else {
      this.tableStatus = this.data.status;
      this.tableCapacity = this.data.capacity;
      this.tablePositionX = this.data.position_x;
      this.tablePositionY = this.data.position_y;
    }
  }


  // flag判斷是要更新table還是刪除table  true為刪除  false為更新
  // data.mod 變數分為編輯與新增 用來判斷這次執行是進行新增桌位還是編輯已存在的桌位
  tableEdit(flag: boolean) {

    if (this.data.mod == "編輯") {

      //刪除桌位----
      if (flag) {

        console.log(this.data.tableInfo)

        const dialogRef = this.dialog.open(DialogComponent, {
          data: { message: "是否確定要刪除桌位" },
          width: 'auto',
          height: 'auto'
        });

        dialogRef.afterClosed().subscribe(res => {
          console.log(res)
          if (res) {
            let url = "http://localhost:8080/table/del";
            this.service.postApi(url, this.data.tableInfo).subscribe((res: any) => {
              console.log(res)
              if (res.code == 200) {
                this.dialogRef.close(true);
              } else {
                this.dialog.open(DialogComponent, {
                  data: { message: res.message },
                  width: 'auto',
                  height: 'auto'
                });
              }
            });
          }
        });
        //----刪除桌位

        //更新桌位----
      } else {
        let url = "http://localhost:8080/table/update";
        let table: Table = {
          tableId: this.tableId, tableStatus: this.tableStatus, tableCapacity: this.tableCapacity,
          tablePositionX: this.tablePositionX, tablePositionY: this.tablePositionY
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
          }))
          .subscribe((res: any) => {
            console.log(res)
            if (res.code == 200) {
              this.dialogRef.close(true);
            } else {
              this.dialog.open(DialogComponent, {
                data: { message: res.message, flag: true },
                width: 'auto',
                height: 'auto'
              });
            }
          });
      }
      // ----更新桌位

      //新增桌位----
    } else if (this.data.mod == "新增") {
      let url = "http://localhost:8080/table/add";
      let table: Table = {
        tableId: this.tableId, tableStatus: this.tableStatus, tableCapacity: this.tableCapacity,
        tablePositionX: this.tablePositionX, tablePositionY: this.tablePositionY
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
        }))
        .subscribe((res: any) => {
          console.log(res);
          if (res.code == 200) {
            this.dialogRef.close(true);
          } else {
            this.dialog.open(DialogComponent, {
              data: { message: res.message, flag: true },
              width: 'auto',
              height: 'auto'
            });
          }
        })
    }
    // ----新增桌位
  }


}
