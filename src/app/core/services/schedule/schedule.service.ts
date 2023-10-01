import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, of } from 'rxjs';
import { ScheduleEvent } from 'src/app/models/scheduleEvent';

@Injectable({
  providedIn: 'root'
})
export class ScheduleService {

  private readonly API_URL = 'https://www.googleapis.com/calendar/v3/calendars/kocmoc.collective@gmail.com/events?singleEvents=true&orderBy=startTime&maxResults=2000&key=AIzaSyDyNSG-eHUJ8YrGZRCojAq_AIdUYg4YPWE';

  constructor(private http: HttpClient) { }

  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {
      console.error(error);
      return of(result as T);
    };
  }

  getScheduleEvents(): Observable<ScheduleEvent[]> {
    return this.http.get<ScheduleEvent[]>(this.API_URL).pipe(
      catchError(this.handleError<ScheduleEvent[]>('getScheduleEvents', []))
    );
  }
}
