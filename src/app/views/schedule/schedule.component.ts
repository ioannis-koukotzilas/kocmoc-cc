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

  loading = false;

  constructor(private scheduleService: ScheduleService) { }

  ngOnInit(): void {
    this.loading = true;

    const currentDate = new Date().toJSON();

    this.scheduleService.getScheduleEvents()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe({
        next: (data: any) => {
          const rawEvents = data.items;
          const scheduleEvents = rawEvents.map((event: any) => new ScheduleEvent(event));
          this.scheduleEvents = [...this.scheduleEvents, ...scheduleEvents]
            // .filter(item => new Date(item.end).toJSON() > currentDate) // Only keep upcoming or ongoing events
            .sort((a, b) => a.start.getTime() - b.start.getTime()) // Sort by start date
            .slice(-5); // Get the last 5 events
         // this.scheduleEvents = this.scheduleEvents.filter(item => new Date(item.end).toJSON() > currentDate);
          this.loading = false;
        },
        error: (err) => {
          console.error('Error fetching schedule events:', err);
          this.loading = false;
        },
        complete: () => {
          console.log('Schedule data fetching complete');
          this.loading = false;
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