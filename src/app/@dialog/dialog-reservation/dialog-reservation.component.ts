import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';

@Component({
  selector: 'app-dialog-reservation',
  imports: [
    MatDialogActions,
    MatDialogContent,
    MatDialogTitle
  ],
  templateUrl: './dialog-reservation.component.html',
  styleUrl: './dialog-reservation.component.scss'
})
export class DialogReservationComponent {

  readonly dialogRef = inject(MatDialogRef<DialogReservationComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);


  onClick() {
    this.dialogRef.close();
  }

}
