import { CommonModule, DatePipe } from '@angular/common';
import { Component, Inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatDialogActions, MatDialogContent, MatDialogRef, MatDialogTitle, MAT_DIALOG_DATA } from "@angular/material/dialog";
import { DataService } from '../../@service/data.service';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-activity-dialog',
  imports: [
    CommonModule,
    FormsModule,
    MatDialogTitle,
    MatDialogContent,
    MatDialogActions,
    CommonModule,
    MatIconModule
  ],
  providers: [
    DatePipe
  ],
  templateUrl: './activity-dialog.component.html',
  styleUrl: './activity-dialog.component.scss'
})
export class ActivityDialogComponent {
  public activityData!: Activity;

  constructor(
    public dialogRef: MatDialogRef<ActivityDialogComponent, DialogResult>,
    @Inject(MAT_DIALOG_DATA) public rawData: CreateActivity,
    private datePipe: DatePipe,
    private dataService: DataService,
  ) { }


  ngOnInit(): void {
    this.activityData = this.processRawData(this.rawData);
    console.log('Dialog 內生成的 Activity:', this.activityData);
  }

  private processRawData(data: CreateActivity): Activity {
    return {
      calendarTitle: data.calendarTitle,
      calendarDescription: data.calendarDescription,
      calendarStartDate: new Date(data.calendarStartDate),
      calendarEndDate: new Date(data.calendarEndDate),
      calendarStatus: 'draft',
      calendarPhoto: data.calendarPhoto || null,
    };
  }

  onCancelClick(): void {
    this.dialogRef.close({ action: 'cancel' });
  }

  private _mapActivityToCalendarBody(published: boolean): any {
    const activityData = this.activityData;

    console.log('Activity Data:', activityData);

    const dateFormat = 'yyyy-MM-dd HH:mm:ss';

    const mappedBody = {
      calendarTitle: activityData.calendarTitle,
      calendarDescription: activityData.calendarDescription,

      calendarStartDate: this.datePipe.transform(activityData.calendarStartDate, dateFormat),
      calendarEndDate: this.datePipe.transform(activityData.calendarEndDate, dateFormat),

      calendarPhoto: activityData.calendarPhoto,
      calendarStatus: published
    };

    return mappedBody;
  }

  onPublishClick(): void {
    const body = this._mapActivityToCalendarBody(true);

    this.dataService.postApi('calendar/create', body)
      .subscribe((res: any) => {
        console.log('活動已發布:', res);

        const savedActivity = res.data || res.activity || res.calendar || res;

        if (savedActivity.calendarId) {
          this.activityData.calendarId = savedActivity.calendarId;
        }

        this.activityData.calendarStatus = 'published';

        this.dialogRef.close({
          action: 'published',
          data: { ...this.activityData } as Activity
        });
      }
      );
  }

  onSaveClick(): void {
    const body = this._mapActivityToCalendarBody(false);

    this.dataService.postApi('calendar/create', body)
      .subscribe((res: any) => {
        console.log('活動已暫存:', res);

        const activityWithId = res.activity;
        this.dialogRef.close({ action: 'saveDraft', data: activityWithId });

        const savedActivity = res.data || res.activity || res.calendar || res;

        if (savedActivity.calendarId) {
          this.activityData.calendarId = savedActivity.calendarId;
        }

        this.activityData.calendarStatus = 'draft';

        this.dialogRef.close({
          action: 'saveDraft',
          data: { ...this.activityData } as Activity
        });
      }
      );
  }
}

export interface Activity {
  calendarId?: number;
  calendarTitle: string;
  calendarDescription: string;
  calendarStartDate: Date;
  calendarEndDate: Date;
  calendarStatus: 'published' | 'draft';
  calendarPhoto: string | null;
}

export interface CreateActivity {
  calendarTitle: string;
  calendarDescription: string;
  calendarStartDate: string;
  calendarEndDate: string;
  calendarPhoto?: string | null;
}

export interface DialogResult {
  action: 'published' | 'saveDraft' | 'cancel';
  data?: Activity;
}
