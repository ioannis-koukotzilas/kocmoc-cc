import { Component, OnInit } from '@angular/core';
import { Subject, catchError, map, of, takeUntil } from 'rxjs';
import { ScheduleService } from 'src/app/core/services/schedule/schedule.service';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Producer } from 'src/app/models/producer';
import { ScheduleEvent } from 'src/app/models/scheduleEvent';

@Component({
  selector: 'schedule',
  templateUrl: './schedule.component.html',
  styleUrls: ['./schedule.component.css']
})
export class ScheduleComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  scheduleEvents: ScheduleEvent[] = [];
  timeZone: string | null = null;
  updated: string | null = null;
  loading = false;

  constructor(private scheduleService: ScheduleService, private wpService: WPService) { }

  ngOnInit(): void {
    this.getScheduledEvents();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getScheduledEvents(): void {
    this.loading = true;
    const currentDate = new Date();
    this.scheduleService.getScheduleEvents()
      .pipe(
        takeUntil(this.unsubscribe$),
        map((data: any) => {
          this.timeZone = data.timeZone;
          this.updated = new Date(data.updated).toDateString();

          const filteredEvents = data.items
            .filter((event: any) => {
              const eventStartDate = new Date(event.start.dateTime);
              return eventStartDate > currentDate;
            });
          const sortedEvents = filteredEvents.sort((a: any, b: any) => new Date(a.start.dateTime).getTime() - new Date(b.start.dateTime).getTime());
          return sortedEvents.slice(0, 8) as ScheduleEvent[];
        })
      )
      .subscribe({
        next: (scheduleEvents) => {
          this.scheduleEvents = scheduleEvents.map(event => new ScheduleEvent(event));
          this.matchProducerWithCalendarApi(() => {
            this.loading = false;
          });
        },
        error: (err) => {
          console.error('Error fetching schedule events:', err);
          this.loading = false;
        }
      });
  }

  private matchProducerWithCalendarApi(operationCompleted: () => void): void {
    const perPage = 100;
    let currentPage = 1;
    const fetchProducers = () => {
      this.wpService.getProducers(currentPage, perPage).subscribe({
        next: (response) => {
          this.scheduleEvents.forEach(event => {
            if (event.summary) {
              const matchedProducers = response.producers.filter(producer =>
                event.summary.toLowerCase().includes(producer.name.toLowerCase()));
              if (matchedProducers.length > 0) {
                event.producers = matchedProducers;
              }
            }
          });
          const totalPages = Number(response.headers.get('X-WP-TotalPages'));
          if (currentPage < totalPages) {
            currentPage++;
            fetchProducers();
          } else {
            operationCompleted();
          }
        },
        error: (error) => {
          console.error('Error fetching producers:', error);
          operationCompleted();
        },
      });
    };

    fetchProducers();
  }

}