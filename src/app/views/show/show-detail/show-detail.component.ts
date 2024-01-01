import { Component } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { Show } from 'src/app/models/show';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';

@Component({
  selector: 'app-show-detail',
  templateUrl: './show-detail.component.html',
  styleUrls: ['./show-detail.component.css']
})
export class ShowDetailComponent {
  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  loading: boolean = true;

  show: Show | null = null;

  relatedEpisodes: Episode[] = [];

  page: number = 1;
  perPage: number = 9;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private location: Location, private audioPlayerService: AudioPlayerService, private wpService: WPService) { }

  ngOnInit(): void {
    this.getShow();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getShow() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id') || '0');
        this.loading = true;
        return this.wpService.getShow(id).pipe(
          catchError(error => {
            console.error('Error getting show from WPService:', error);
            return of(null);
          })
        );
      }),
      tap(show => {
        if (show) this.show = new Show(show);
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.getShowProducers(this.show?.id || 0, () => {
          this.loading = false;
        });
        this.getShowEpisodes(this.page, this.perPage, this.show?.id || 0, () => {
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Main observable error while processing show:', error);
      },
      complete: () => {
        console.log('Show detail component unsubscription completed.');
      }
    });
  }

  getShowProducers(id: number, operationCompleted: () => void): void {
    this.wpService.getShowProducers([id]).pipe(
      tap(producers => {
        if (this.show && producers) {
          this.show.producers = producers;
        }
      }),
      catchError(error => {
        console.error('Error fetching producers for the show:', error);
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        console.log('Successfully fetched producers for the show.');
        operationCompleted();
      },
      error: (error) => {
        console.error('Main observable error while fetching show producers:', error);
        operationCompleted();
      }
    });
  }

  getShowEpisodes(page: number, perPage: number, id: number, operationCompleted: () => void): void {
    this.wpService.getShowEpisodes(page, perPage, [id]).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));
        this.relatedEpisodes = [...episodes];
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
      },
    });
  }

  back() {
    this.location.back();
  }
}
