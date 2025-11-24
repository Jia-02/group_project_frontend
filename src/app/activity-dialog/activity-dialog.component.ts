import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-activity-dialog',
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    MatDialogClose,
    DatePipe
  ],
  templateUrl: './activity-dialog.component.html',
  styleUrl: './activity-dialog.component.scss'
})
export class ActivityDialogComponent {
  constructor(
    public dialogRef: MatDialogRef<ActivityDialogComponent, DialogResult>,
    @Inject(MAT_DIALOG_DATA) public data: Activity
  ) { }

  onPublishClick(): void {
    this.dialogRef.close({ action: 'publish' });
  }

  onSaveClick(): void {
    this.dialogRef.close({ action: 'save' });
  }

  onCancelClick(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

}

export interface Activity {
  title: string;
  startDate: Date;
  endDate: Date;
  description: string;
}

export interface DialogResult {
  action: 'publish' | 'save' | 'cancel';
}
