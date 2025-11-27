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
    private dialogRef: MatDialogRef<ActivityReadDialogComponent>){}

    close() {
    this.dialogRef.close();
  }

  photoBase64: string | null = null;

  convertToBase64(file: File): void {
    const reader = new FileReader();
    reader.onload = () => {
      this.photoBase64 = reader.result as string;
      console.log('圖片已轉換為 Base64');
    };
    reader.onerror = (error) => {
      console.error('檔案讀取失敗', error);
      this.photoBase64 = null;
    };
    reader.readAsDataURL(file);
  }
}
