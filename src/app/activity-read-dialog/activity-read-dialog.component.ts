import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { Activity } from '../calendar/calendar.component';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-activity-read-dialog',
  imports: [
    DatePipe,
    CommonModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
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
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    console.log(this.activity);

  }

  close() {
    this.dialogRef.close();
  }
}
