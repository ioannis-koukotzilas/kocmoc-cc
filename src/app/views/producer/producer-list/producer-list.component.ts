import { Component } from '@angular/core';
import { Subject, catchError, map, of, takeUntil } from 'rxjs';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Producer } from 'src/app/models/producer';

@Component({
  selector: 'app-producer-list',
  templateUrl: './producer-list.component.html',
  styleUrls: ['./producer-list.component.css']
})
export class ProducerListComponent {
  private unsubscribe$ = new Subject<void>();

  producers: Producer[] = [];

  loading: boolean = false;

  initialLoading: boolean = true;

  page: number = 1;
  perPage: number = 6;

  activeBtn: 'activeResidents' | 'activeGuests' | 'inactiveResidents' = 'activeResidents';

  constructor(private wpService: WPService, public audioPlayerService: AudioPlayerService) { }

  ngOnInit() {
    this.getActiveResidentProducers();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getActiveResidentProducers() {
    this.producers = [];
    this.activeBtn = 'activeResidents';
    this.loading = true;
    this.wpService.getActiveResidentProducers().pipe(
      map((producers: Producer[]) => {
        console.log('Received producers:', producers); // Log raw data
        const producerObjects = producers.map(producer => new Producer(producer));
        this.producers = [...this.producers, ...producerObjects];
        return producerObjects;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the producers list:', error);
        this.loading = false;
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.initialLoading = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
        this.loading = false;
      },
      complete: () => {
        console.log('getActiveResidentProducers completed.');
      }
    });
  }

  getActiveGuestProducers() {
    this.producers = [];
    this.activeBtn = 'activeGuests';
    this.loading = true;
    this.wpService.getActiveGuestProducers().pipe(
      map((producers: Producer[]) => {
        const producerObjects = producers.map(producer => new Producer(producer));
        this.producers = [...this.producers, ...producerObjects];
        return producerObjects;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the producers list:', error);
        this.loading = false;
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
        this.loading = false;
      },
      complete: () => {
        console.log('getActiveGuestProducers completed.');
      }
    });
  }

  getInactiveResidentProducers() {
    this.producers = [];
    this.activeBtn = 'inactiveResidents';
    this.loading = true;
    this.wpService.getInactiveResidentProducers().pipe(
      map((producers: Producer[]) => {
        const producerObjects = producers.map(producer => new Producer(producer));
        this.producers = [...this.producers, ...producerObjects];
        return producerObjects;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the producers list:', error);
        this.loading = false;
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
        this.loading = false;
      },
      complete: () => {
        console.log('getInactiveResidentProducers completed.');
      }
    });
  }
}
