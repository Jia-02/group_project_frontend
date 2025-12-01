import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog',
  imports: [FormsModule],
  templateUrl: './dialog.component.html',
  styleUrl: './dialog.component.scss'
})
export class DialogComponent {

  readonly dialogRef = inject(MatDialogRef<DialogComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);

  workStationName!:string;

  next(flag:boolean){
    if(flag){
      this.dialogRef.close(this.workStationName);
    }else{
      this.dialogRef.close();
    }
  }

}
