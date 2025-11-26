import { DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogContent, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-activity-dialog',
  imports: [MatFormFieldModule,
    MatInputModule,
    FormsModule,
    MatButtonModule,
    MatDialogContent,
    MatDialogActions,
    DatePipe
  ],
  templateUrl: './activity-dialog.component.html',
  styleUrl: './activity-dialog.component.scss'
})
export class ActivityDialogComponent {

  public activityData!: Activity;
  public photo: string | null;

  constructor(
    public dialogRef: MatDialogRef<ActivityDialogComponent, DialogResult>,
    @Inject(MAT_DIALOG_DATA) public rawData: CreateActivity
  ) {

    this.photo = (this.rawData as any).photoBase64 || null;
  }

  ngOnInit(): void {
    this.activityData = this.processRawData(this.rawData);
    console.log('Dialog 內生成的 Activity:', this.activityData);
  }

  private extractTitle(text: string): string {
    const separators = ['，', ',', '。'];
    const firstPart = text.split(new RegExp(separators.join('|')))[0];
    return firstPart.replace(/優惠|活動|促銷/g, '').trim();
  }

  private detectDuration(text: string): number {
    const t = text.replace(/\s+/g, '').toLowerCase();
    const m = text.match(/持續(\d+)[天日週週天]/);
    if (m && m[1]) return parseInt(m[1], 10);
    return 1;
  }

  private processRawData(data: CreateActivity): Activity {
    const durationDays = this.detectDuration(data.inputText);

    const start = new Date(data.startDate);
    const end = new Date(start);

    end.setDate(start.getDate() + durationDays - 1);

    return {
      title: this.extractTitle(data.inputText),
      description: data.inputText,
      startDate: start,
      endDate: end,
      photo: this.photo,
    };
  }

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
    description: string;
    startDate: Date;
    endDate: Date;
    photo: string | null;
}

export interface CreateActivity {
    inputText: string;
    startDate: string;
    photoFile?: File | null;
}

export interface DialogResult {
    action: 'publish' | 'save' | 'cancel';
}
