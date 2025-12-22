import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialog, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Activity } from '../allActivity/calendar/calendar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { ActivityReadDialogComponent } from '../allActivity/activity-read-dialog/activity-read-dialog.component';

@Component({
  selector: 'app-board-dialog',
  imports: [
    DatePipe,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    MatIconModule,
  ],
  templateUrl: './board-dialog.component.html',
  styleUrl: './board-dialog.component.scss'
})
export class BoardDialogComponent {
  activities: Activity[] = [];

  constructor(
    @Inject(MAT_DIALOG_DATA) public data: { activities: Activity[] },
    public dialogRef: MatDialogRef<BoardDialogComponent>,
    private dialog: MatDialog
  ) {
    this.activities = data.activities;
  }

  ngOnInit(): void {
    this.activities.sort((a, b) => {
      return a.calendarStartDate.getTime() - b.calendarStartDate.getTime();
    });

    console.log('Board Dialog received activities:', this.activities);
  }

  getBackgroundStyle(url: string | null): string {
    if (!url) {
      return 'linear-gradient(135deg, #ddd 0%, #eee 100%)';
    }
    return `url('${url}')`;
  }

  watchActivity(activity: any) { // 確保傳入點選的活動物件
  this.dialog.open(ActivityReadDialogComponent, {
    width: '600px',
    maxWidth: '90vw',
    data: activity,
  });
}

  closeDialog(): void {
    this.dialogRef.close('closed by button');
  }
}
