import { Component } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil } from 'rxjs';
import { Episode } from 'src/app/models/episode';
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

  loading: boolean = true;

  page: number = 1;
  perPage: number = 1;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  filteredProducers: Producer[] = [];
  filter: 'resident' | 'guest' = 'resident';


  constructor(private wpService: WPService, public audioPlayerService: AudioPlayerService) { }

  ngOnInit() {
    this.getProducers(this.page, this.perPage);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getProducers(page: number, perPage: number) {
    this.wpService.getProducers(page, perPage).pipe(
      map(data => {
        let producers = data.producers.map(producer => new Producer(producer));

        // producers = producers.filter(producer => producer.producerType === 'resident' && producer.producerStatus === 'active');

        producers = producers.filter(producer => producer.producerStatus === 'active');

        this.producers = [...this.producers, ...producers];

        this.filterProducers();

        const totalPages = Number(data.headers.get('X-WP-TotalPages'));
        if (page >= totalPages) {
          this.hasMore = false;
        }
        return producers;
      }),
      catchError(error => {
        console.error('WPService observable error while getting the producers list:', error);
        return of(null); // Emit null to let outer stream continue.
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Get producers completed.');
      }
    });
  }

  filterProducers() {
    this.filteredProducers = this.producers.filter(producer => producer.producerType === this.filter);
  }

  setFilter(filterType: 'resident' | 'guest') {
    this.filter = filterType;
    this.filterProducers();
  }

  loadMore() {
    this.loadingMore = true;
    this.page += 1;
    this.getProducers(this.page, this.perPage);
  }
}
