import { Component, OnInit } from '@angular/core';
import { Subject, catchError, map, of, takeUntil } from 'rxjs';
import { ScheduleService } from 'src/app/core/services/schedule/schedule.service';
import { ScheduleEvent } from 'src/app/models/scheduleEvent';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();
  scheduleEvents: ScheduleEvent[] = [];

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    const currentDate = new Date().toJSON();

    this.scheduleService.getScheduleEvents()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => {
          const rawEvents = data.items;
          const scheduleEvents = rawEvents.map((event: any) => new ScheduleEvent(event));
          this.scheduleEvents = [...this.scheduleEvents, ...scheduleEvents];
         // this.scheduleEvents = this.scheduleEvents.filter(item => new Date(item.end).toJSON() > currentDate);
        },
        error: (err) => {
          console.error('Error fetching schedule events:', err);
        },
        complete: () => {
          console.log('Schedule data fetching complete');
        }
      });
  }
  
  




  // ngOnInit(): void {
  //   const currentDate = new Date();
  
  //   this.scheduleService.getScheduleEvents()
  //     .pipe(takeUntil(this.unsubscribe$))
  //     .subscribe({
  //       next: (response: { items: ScheduleEvent[] }) => {
  //         this.scheduleEvents = response.items
  //           .map(item => new ScheduleEvent(item))
  //           .filter(event => event.end > currentDate);
  //       },
  //       error: (err) => {
  //         console.error('Error fetching schedule events:', err);
  //       },
  //       complete: () => {
  //         console.log('Schedule data fetching complete');
  //       }
  //     });
  // }
  

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}