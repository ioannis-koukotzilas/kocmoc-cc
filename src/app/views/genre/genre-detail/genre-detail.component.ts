import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, Subscription, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Episode } from 'src/app/models/episode';
import { Genre } from 'src/app/models/genre';
import { AudioPlayerService } from '../../audio-player/audio-player.service';

@Component({
  selector: 'app-genre-detail',
  templateUrl: './genre-detail.component.html',
  styleUrls: ['./genre-detail.component.css']
})

export class GenreDetailComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  loading: boolean = true;

  genre: Genre | null = null;

  relatedEpisodes: Episode[] = [];

  page: number = 1;
  perPage: number = 1;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private location: Location, private audioPlayerService: AudioPlayerService, private wpService: WPService) { }

  ngOnInit(): void {
    this.getGenre();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getGenre() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id') || '0');
        this.loading = true;
        this.resetRelatedEpisodes();
        return this.wpService.getGenre(id);
      }),
      tap(genre => {
        this.genre = new Genre(genre);
        this.getGenreEpisodes(this.page, this.perPage, this.genre?.id || 0);
      }),
      catchError(error => {
        console.error('Error getting genre from WPService:', error);
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {},
      error: (error) => {
        console.error('Main observable error while processing genre:', error);
      },
      complete: () => {
        console.log('Genre detail component genre fetch completed.');
      }
    });
  }

  getGenreEpisodes(page: number, perPage: number, id: number) {
    this.wpService.getGenreEpisodes(page, perPage, [id]).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));
        this.relatedEpisodes = [...this.relatedEpisodes, ...episodes];
        const episodeIds = episodes.map(episode => episode.id);

        const totalPages = Number(data.headers.get('X-WP-TotalPages'));
        if (page >= totalPages) {
          this.hasMore = false;
        }

        return forkJoin([
          this.wpService.getEpisodeProducer(episodeIds),
          this.wpService.getEpisodeShow(episodeIds),
          this.wpService.getEpisodeGenre(episodeIds),
          this.wpService.getEpisodeArtist(episodeIds)
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
        this.loading = false;
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

  loadMore() {
    if (this.hasMore) {
      this.page += 1;
      this.loadingMore = true;
      this.getGenreEpisodes(this.page, this.perPage, this.genre?.id || 0);
    }
  }

  resetRelatedEpisodes() {
    this.relatedEpisodes = [];
    this.page = 1;
    this.hasMore = true;
  }

  back() {
    this.location.back();
  }
}
