import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import {
  MAT_DIALOG_DATA,
  MatDialog,
  MatDialogActions,
  MatDialogClose,
  MatDialogContent,
  MatDialogRef,
  MatDialogTitle,
} from '@angular/material/dialog';
@Component({
  selector: 'app-dialog',
  imports: [FormsModule,MatDialogTitle,MatDialogContent,MatDialogActions],
  templateUrl: './dialog.html',
  styleUrl: './dialog.scss',
})
export class Dialog {


   readonly dialogRef = inject(MatDialogRef<Dialog>);
  readonly data =inject<any>(MAT_DIALOG_DATA);

  onYesClick(): void {
    this.dialogRef.close(true); // 這裡可以返回某些資料，這裡示範返回 `true`
  }


}
