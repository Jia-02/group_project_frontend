import { Component, ElementRef, inject, ViewChild } from '@angular/core';
import { DataService, TableRes } from '../data/data.service';
import { MatDialog } from '@angular/material/dialog';
import { AddTableComponent } from './add-table/add-table.component';

@Component({
  selector: 'app-table',
  imports: [],
  templateUrl: './table.component.html',
  styleUrl: './table.component.scss'
})
export class TableComponent {

  readonly dialog = inject(MatDialog);

  constructor(private service: DataService) { }

  @ViewChild('myCanvas') canvas!: ElementRef;

  ngOnInit(): void {
    let url = "http://localhost:8080/table/list";
    this.service.getApi(url).subscribe((res: TableRes) => {
      console.log(res)
      const canvasElement = this.canvas.nativeElement;
      const ctx = canvasElement.getContext('2d');
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

    const dialogRef = this.dialog.open(AddTableComponent, {
      data: { status: "空位", capacity: 2, position_x: x, position_y: y },
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
          for (let i = 0; i < res.tableList.length; i++) {
            ctx.fillStyle = 'red';
            ctx.fillRect(res.tableList[i].tablePositionX, res.tableList[i].tablePositionY, 20, 20);
          }
        })
      }
    })

  }


}
