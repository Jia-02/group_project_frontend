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

  handleClick(e: MouseEvent) {
    console.log(e.clientX, e.clientY)
    const canvasElement = this.canvas.nativeElement;
    const ctx = canvasElement.getContext('2d');
    const rect = canvasElement.getBoundingClientRect()
    let x = e.clientX - rect.left;
    let y = e.clientY - rect.top;
    let flag = true;
    for (let i = 0; i < this.tableList.length; i++) {
      if (this.tableList[i].tablePositionX <= x && (this.tableList[i].tablePositionX + 20) >= x &&
        this.tableList[i].tablePositionY <= y && (this.tableList[i].tablePositionY + 20) >= y) {
        flag = false;
        const dialogRef = this.dialog.open(TableEditComponent, {
          data: { tableInfo: this.tableList[i], mod: "編輯" },
          width: 'auto',
          height: 'auto'
        });
        dialogRef.afterClosed().subscribe(res => {
          let url = "http://localhost:8080/table/list";
          if (res) {
            this.service.getApi(url).subscribe((res: TableRes) => {
              console.log(res)
              const canvasElement = this.canvas.nativeElement;
              const ctx = canvasElement.getContext('2d');
              ctx.reset();
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

    if (flag) {
      const dialogRef = this.dialog.open(TableEditComponent, {
        data: { status: "空位", capacity: 2, position_x: x, position_y: y, mod: "新增" },
        width: 'auto',
        height: 'auto'
      });

      dialogRef.afterClosed().subscribe(res => {
        let url = "http://localhost:8080/table/list";
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


