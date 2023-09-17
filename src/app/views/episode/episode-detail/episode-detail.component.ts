import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Location } from '@angular/common';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';

import { Episode } from 'src/app/models/episode';
import { AudioPlayerService } from '../../audio-player/audio-player.service';
import { WPService } from 'src/app/core/services/wp/wp.service';

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
  perPage: number = 9;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private route: ActivatedRoute, private wpService: WPService, private audioPlayerService: AudioPlayerService, private location: Location) { }

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
            return of(null);  // Continue the stream by emitting null.
          })
        );
      }),
      tap(episode => {
        if (episode) this.episode = new Episode(episode);
      }),
      switchMap(episode => {
        if (!episode) return of({ shows: [], genres: [], artists: [], tracklists: [] });  // If episode retrieval failed, continue with empty data.
        return forkJoin({
          shows: this.wpService.getEpisodeShow([episode.id]),
          genres: this.wpService.getEpisodeGenre([episode.id]),
          artists: this.wpService.getEpisodeArtist([episode.id]),
          tracklists: this.wpService.getEpisodeTracklist([episode.id])
        }).pipe(
          catchError(error => {
            console.error('ForkJoin error getting episode details:', error);
            return of(null);  // Continue the stream by emitting null.
          })
        );
      }),
      tap((data) => {
        if (data) {
          const { shows, genres, artists, tracklists } = data;
          if (this.episode) {
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
        this.loading = false;
        const shows = this.episode?.shows?.map(show => show.id);
        if (shows && shows.length > 0) {
          this.getRelatedEpisodes(this.page, this.perPage, shows);
        }
      },
      error: (error) => {
        console.error('Main observable error while processing episode:', error);
      },
      complete: () => {
        console.log('Episode detail component unsubscription completed.');
      }
    });
  }

  getRelatedEpisodes(page: number, perPage: number, id: number[]) {
    this.wpService.getRelatedEpisodes(page, perPage, id).pipe(
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
          this.wpService.getEpisodeShow(id),
          this.wpService.getEpisodeGenre(id),
          this.wpService.getEpisodeArtist(id)
        ]).pipe(
          map(([shows, genres, artists]) => {
            filteredEpisodes.forEach(episode => {
              episode.shows = shows.filter(show => show.episodeId === episode.id);
              episode.genres = genres.filter(genre => genre.episodeId === episode.id);
              episode.artists = artists.filter(artist => artist.episodeId === episode.id);
            });
            return [shows, genres, artists];
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

  goBack() {
    this.location.back();
  }
}