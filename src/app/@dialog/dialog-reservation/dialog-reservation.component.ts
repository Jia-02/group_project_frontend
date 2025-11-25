import { reservation } from './../../@interface/interface';
import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatNativeDateModule } from '@angular/material/core';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-dialog-reservation',
  imports: [

    MatDialogActions,
    MatDialogContent,
    MatDialogTitle,
    FormsModule,

  ],
  standalone: true,
  templateUrl: './dialog-reservation.component.html',
  styleUrl: './dialog-reservation.component.scss'
})
export class DialogReservationComponent {

  selectedDate: Date | null = null;
  selectedTime: string = '';

  constructor() { }
  reservation: reservation = {
    newDate: '',
    reservationDate: '',
    reservationTime: '',
    reservationPhone: '',
    reservationName: '',
    reservationCount: 0,
    reservationAdultCount: 0,
    reservationChildCount: 0,
    reservationStatus: false,
    reservationNote: '',
    childSeat: 0,
    tableId: ''
  };
  readonly dialogRef = inject(MatDialogRef<DialogReservationComponent>);
  readonly data = inject<any>(MAT_DIALOG_DATA);



  onClick() {
    this.dialogRef.close();
  }

}
