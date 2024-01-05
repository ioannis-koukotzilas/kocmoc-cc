import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';

import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Title } from '@angular/platform-browser';

@Component({
  selector: 'app-episode-detail',
  templateUrl: './episode-detail.component.html',
  styleUrls: ['./episode-detail.component.css']
})
export class EpisodeDetailComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  episode: Episode | null = null;
  relatedEpisodes: Episode[] = [];

  loading: boolean = true;

  page: number = 1;
  perPage: number = 6;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private wpService: WPService, private audioPlayerService: AudioPlayerService, private location: Location, private titleService: Title) { }

  ngOnInit() {
    this.getEpisode();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getEpisode() {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id') || '0');
        this.loading = true;
        return this.wpService.getEpisode(id).pipe(
          catchError(error => {
            console.error('Error getting episode from WPService:', error);
            return of(null);
          })
        );
      }),
      tap(episode => {
        if (episode) {
          this.episode = new Episode(episode);
          this.titleService.setTitle(`${this.episode.title} - KOCMOC`);
        } 
      }),
      switchMap(episode => {
        if (!episode) return of({ producers: [], shows: [], genres: [], artists: [], tracklists: [] });
        return forkJoin({
          producers: this.wpService.getEpisodeProducer([episode.id]),
          shows: this.wpService.getEpisodeShow([episode.id]),
          genres: this.wpService.getEpisodeGenre([episode.id]),
          artists: this.wpService.getEpisodeArtist([episode.id]),
          tracklists: this.wpService.getEpisodeTracklist([episode.id])
        }).pipe(
          catchError(error => {
            console.error('ForkJoin error getting episode details:', error);
            return of(null);
          })
        );
      }),
      tap((data) => {
        if (data) {
          const { producers, shows, genres, artists, tracklists } = data;
          if (this.episode) {
            this.episode.producers = producers;
            this.episode.shows = shows;
            this.episode.genres = genres;
            this.episode.artists = artists;
            this.episode.tracklists = tracklists;
          }
        }
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        const shows = this.episode?.shows?.map(show => show.id);
        if (shows && shows.length > 0) {
          this.getRelatedShowEpisodes(this.page, this.perPage, shows, () => {
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Main observable error while processing episode:', error);
        this.loading = false;
      }
    });
  }

  getRelatedShowEpisodes(page: number, perPage: number, id: number[], operationCompleted: () => void): void {
    this.wpService.getRelatedShowEpisodes(page, perPage, id).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));
        const filteredEpisodes = episodes.filter(x => x.id !== this.episode?.id);

        this.relatedEpisodes = [...filteredEpisodes];

        const id = filteredEpisodes.map(episode => episode.id);

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
            filteredEpisodes.forEach(episode => {
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
      }
    });
  }

  back(): void {
    this.location.back();
  }
}