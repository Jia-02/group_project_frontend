import { Component, inject } from '@angular/core';
import { DataService, Table } from '../../data/data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

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

  tableId!: string;
  tableStatus!: string;
  tableCapacity!: number;
  tablePositionX!: number;
  tablePositionY!: number;

  ngOnInit(): void {
    if (this.data.tableInfo) {
      this.tableId = this.data.tableInfo.tableId;
      this.tableStatus = this.data.tableInfo.tableStatus;
      this.tableCapacity = this.data.tableInfo.tableCapacity;
      this.tablePositionX = this.data.tableInfo.tablePositionX;
      this.tablePositionY = this.data.tableInfo.tablePositionY;
    } else {
      this.tableStatus = this.data.status;
      this.tableCapacity = this.data.capacity;
      this.tablePositionX = this.data.position_x;
      this.tablePositionY = this.data.position_y;
      let url = "http://localhost:8080/table/list";
      this.service.getApi(url).subscribe((res: Table[]) => {
        console.log(res);
      })
    }
  }



  tableEdit(flag: boolean) {
    if (this.data.mod == "編輯") {
      if (flag) {
        let url = "http://localhost:8080/table/del";
        console.log(this.data.tableInfo)
        this.service.postApi(url, this.data.tableInfo).subscribe((res: any) => {
          console.log(res)
          if (res.code == 200) {
            this.dialogRef.close(true);
          }
        });
      } else {
        let url = "http://localhost:8080/table/update";
        let table: Table = {
          tableId: this.tableId, tableStatus: this.tableStatus, tableCapacity: this.tableCapacity,
          tablePositionX: this.tablePositionX, tablePositionY: this.tablePositionY
        }
        console.log(table);
        this.service.postApi(url, table).subscribe((res: any) => {
          console.log(res)
          if (res.code == 200) {
            this.dialogRef.close(true);
          }
        });
      }
    } else if (this.data.mod == "新增") {
      let url = "http://localhost:8080/table/add";
      let table: Table = {
        tableId: this.tableId, tableStatus: this.tableStatus, tableCapacity: this.tableCapacity,
        tablePositionX: this.tablePositionX, tablePositionY: this.tablePositionY
      }
      this.service.postApi(url, table).subscribe((res: any) => {
        console.log(res);
        if (res.code == 200) {
          this.dialogRef.close(true);
        }
      })
    }
  }


}
