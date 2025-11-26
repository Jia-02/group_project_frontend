import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { Activity } from '../calendar/calendar.component';
import { CommonModule, DatePipe } from '@angular/common';

@Component({
  selector: 'app-activity-check-dialog',
  imports: [
    DatePipe,
    CommonModule
  ],
  templateUrl: './activity-check-dialog.component.html',
  styleUrl: './activity-check-dialog.component.scss'
})
export class ActivityCheckDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public activity: Activity,
    private dialogRef: MatDialogRef<ActivityCheckDialogComponent>){}

    close() {
    this.dialogRef.close();
  }

  edit() {
    console.log('Edit:', this.activity);
  }

  publish() {
    this.activity.status = 'published';
    this.dialogRef.close(this.activity);
  }
}
