import { Component, inject } from '@angular/core';
import { DataService, Table } from '../../data/data.service';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-add-table',
  imports: [FormsModule],
  templateUrl: './add-table.component.html',
  styleUrl: './add-table.component.scss'
})
export class AddTableComponent {


  readonly dialogRef = inject(MatDialogRef<AddTableComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);
  constructor(private service:DataService){}

  tableId!:string;
  tableStatus!:string;
  tableCapacity!:number;
  tablePositionX!:number;
  tablePositionY!:number;

  ngOnInit(): void {
    this.tableStatus = this.data.status;
    this.tableCapacity = this.data.capacity;
    this.tablePositionX = this.data.position_x;
    this.tablePositionY = this.data.position_y;
    let url = "http://localhost:8080/table/list";
    this.service.getApi(url).subscribe((res:Table[])=>{
      console.log(res);
    })
  }





  addTable(){
    let url = "http://localhost:8080/table/add";
    let table:Table = {tableId:this.tableId,tableStatus:this.tableStatus,tableCapacity:this.tableCapacity,
      tablePositionX:this.tablePositionX,tablePositionY:this.tablePositionY}
    this.service.postApi(url,table).subscribe((res:any)=>{
      console.log(res);
      if(res.code == 200){
        this.dialogRef.close(true);
      }
    })
  }


}
