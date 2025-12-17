import { Component, Inject } from '@angular/core';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { Activity } from '../calendar/calendar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'app-activity-read-dialog',
  imports: [
    DatePipe,
    CommonModule,
    FormsModule,
    MatDialogContent,
    MatDialogActions,
    MatDialogTitle,
    MatIconModule
  ],
  templateUrl: './activity-read-dialog.component.html',
  styleUrl: './activity-read-dialog.component.scss'
})
export class ActivityReadDialogComponent {
  constructor(
    @Inject(MAT_DIALOG_DATA) public activity: Activity,
    private dialogRef: MatDialogRef<ActivityReadDialogComponent>
  ) { }

  ngOnInit(): void {
    console.log(this.activity);
  }

  close() {
    this.dialogRef.close();
  }
}
