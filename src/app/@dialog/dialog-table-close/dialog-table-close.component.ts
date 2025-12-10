import { Component, inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-table-close',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
  ],
  templateUrl: './dialog-table-close.component.html',
  styleUrl: './dialog-table-close.component.scss'
})
export class DialogTableCloseComponent {


  readonly dialogRef = inject(MatDialogRef<DialogTableCloseComponent>);
  readonly data = inject(MAT_DIALOG_DATA);

  onNoClick() {
    this.dialogRef.close();
  }

}
