import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Producer } from 'src/app/models/producer';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Title } from '@angular/platform-browser';
import { Show } from 'src/app/models/show';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';

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
  perPage: number = 6;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private location: Location, private audioPlayerService: AudioPlayerService, private wpService: WPService, private titleService: Title) { }

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
            return of(null);
          })
        );
      }),
      tap(producer => {
        if (producer) {
          this.producer = new Producer(producer);
          this.titleService.setTitle(`${this.producer.name} - KOCMOC`);
        } 
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.getProducerShows(this.producer?.id || 0, () => {
          this.loading = false;
        });
        this.getProducerEpisodes(this.page, this.perPage, this.producer?.id || 0, () => {
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Main observable error while processing producer:', error);
        this.loading = false;
      }
    });
  }

  getProducerShows(id: number, operationCompleted: () => void): void {
    this.wpService.getProducerShows([id]).pipe(
      tap(shows => {
        if (this.producer && shows) {
          this.producer.shows = shows;
        }
      }),
      catchError(error => {
        console.error('Error getting shows for the producer:', error);
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        console.log('Successfully fetched shows for the producer.');
        operationCompleted();
      },
      error: (error) => {
        console.error('Main observable error while fetching show producers:', error);
        operationCompleted();
      }
    });
  }

  getProducerEpisodes(page: number, perPage: number, id: number, operationCompleted: () => void): void {
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
              episode.producers = episode.producer.map(producerId => producers.find(producer => producer.id === producerId)).filter(producer => producer) as Producer[];
              episode.shows = episode.show.map(showId => shows.find(show => show.id === showId)).filter(show => show) as Show[];
              episode.artists = episode.artist.map(artistId => artists.find(artist => artist.id === artistId)).filter(artist => artist) as Artist[];
              episode.genres = episode.genre.map(genreId => genres.find(genre => genre.id === genreId)).filter(genre => genre) as Genre[];
            });
            return [producers, shows, genres, artists];
          }),
          catchError(error => {
            console.error('ForkJoin observable error while getting details):', error);
            return of(null);
          })
        );
      }),
      catchError(error => {
        console.error('WPService observable error while getting the related episodes list:', error);
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loadingMore = false;
        operationCompleted();
      },
      error: (error) => {
        console.error('Main observable error:', error);
        operationCompleted();
      }
    });
  }

  back() {
    this.location.back();
  }
}
