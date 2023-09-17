import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Producer } from 'src/app/models/producer';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';

@Component({
  selector: 'app-producer-detail',
  templateUrl: './producer-detail.component.html',
  styleUrls: ['./producer-detail.component.css']
})
export class ProducerDetailComponent {
  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  loading: boolean = true;

  producer: Producer | null = null;

  producerEpisodes: Episode[] = [];

  page: number = 1;
  perPage: number = 9;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private audioPlayerService: AudioPlayerService, private wpService: WPService) { }

  ngOnInit(): void {
    this.getProducer();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getProducer() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id') || '0');
        this.loading = true;
        return this.wpService.getProducer(id).pipe(
          catchError(error => {
            console.error('Error getting artist from WPService:', error);
            return of(null);  // Continue the stream by emitting null.
          })
        );
      }),
      tap(producer => {
        if (producer) this.producer = new Producer(producer);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.loading = false;
        this.getProducerEpisodes(this.page, this.perPage, this.producer?.id || 0);
      },
      error: (error) => {
        console.error('Main observable error while processing producer:', error);
      },
      complete: () => {
        console.log('Producer detail component unsubscription completed.');
      }
    });
  }

  getProducerEpisodes(page: number, perPage: number, id: number) {
    this.wpService.getProducerEpisodes(page, perPage, [id]).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));

        this.producerEpisodes = [...episodes];

        const id = episodes.map(episode => episode.id);

        const totalPages = Number(data.headers.get('X-WP-TotalPages'));
        if (page >= totalPages) {
          this.hasMore = false;
        }

        return forkJoin([
          this.wpService.getEpisodeProducer(id),
          this.wpService.getEpisodeShow(id),
          this.wpService.getEpisodeGenre(id),
          this.wpService.getEpisodeArtist(id)
        ]).pipe(
          map(([producers, shows, genres, artists]) => {
            episodes.forEach(episode => {
              episode.producers = producers.filter(producer => producer.episodeId === episode.id);
              episode.shows = shows.filter(show => show.episodeId === episode.id);
              episode.genres = genres.filter(genre => genre.episodeId === episode.id);
              episode.artists = artists.filter(artist => artist.episodeId === episode.id);
            });
            return [producers, shows, genres, artists];
          }),
          catchError(error => {
            console.error('ForkJoin observable error while getting details):', error);
            return of(null);  // Emit null to let outer stream continue.
          })
        );
      }),
      catchError(error => {
        console.error('WPService observable error while getting the related episodes list:', error);
        return of(null); // Emit null to let outer stream continue.
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loadingMore = false;
      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Get related episodes completed.');
      }
    });
  }
}
