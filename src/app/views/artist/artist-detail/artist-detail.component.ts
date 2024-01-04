import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, catchError, concatMap, forkJoin, map, of, switchMap, takeUntil, tap } from "rxjs";
import { WPService } from "src/app/core/services/wp/wp.service";

import { Artist } from "src/app/models/artist";
import { Episode } from "src/app/models/episode";
import { AudioPlayerService } from "../../audio-player/audio-player.service";
import { LastFmService } from "src/app/core/services/last-fm.service";
import { LastFmArtist } from "src/app/models/lastFmArtist";
import { Title } from "@angular/platform-browser";

@Component({
  selector: 'app-artist-detail',
  templateUrl: './artist-detail.component.html',
  styleUrls: ['./artist-detail.component.css']
})

export class ArtistDetailComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  loading: boolean = true;

  artist: Artist | null = null;

  lastFmArtist: LastFmArtist | null = null;

  relatedEpisodes: Episode[] = [];

  page: number = 1;
  perPage: number = 9;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  expandedDescription: boolean = false;

  constructor(private route: ActivatedRoute, private audioPlayerService: AudioPlayerService, private wpService: WPService, private lastFmService: LastFmService, private titleService: Title) { }

  ngOnInit(): void {
    this.getArtist();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getArtist(): void {
    this.route.paramMap.pipe(
      switchMap(params => {
        const id = Number(params.get('id') || '0');
        this.loading = true;
        return this.wpService.getArtist(id).pipe(
          catchError(error => {
            console.error('Error getting artist from WPService:', error);
            return of(null);
          })
        );
      }),
      concatMap(artist => {
        if (artist) {
          this.artist = new Artist(artist);
          this.titleService.setTitle(`${this.artist.name} - KOCMOC`);
          return this.lastFmService.getArtistMetadata(this.artist.name).pipe(
            map((data) => {
              this.lastFmArtist = new LastFmArtist(data);
              return this.lastFmArtist;
            }),
            catchError(error => {
              console.log('Error getting artist metadata from Last.fm:', error);
              return of(artist);
            })
          );
        } else {
          return of(null);
        }
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: (artist) => {
        if (artist) {
          this.getRelatedArtistEpisodes(this.page, this.perPage, this.artist?.id || 0, () => {
            this.loading = false;
          });
        } else {
          this.loading = false;
        }
      },
      error: (error) => {
        console.error('Main observable error:', error);
      }
    });
  }

  private getRelatedArtistEpisodes(page: number, perPage: number, id: number, operationCompleted: () => void): void {
    this.wpService.getRelatedArtistEpisodes(page, perPage, [id]).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));

        this.relatedEpisodes = [...episodes];

        const id = episodes.map(episode => episode.id);

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
            episodes.forEach(episode => {
              episode.shows = shows.filter(show => show.episodeId === episode.id);
              episode.genres = genres.filter(genre => genre.episodeId === episode.id);
              episode.artists = artists.filter(artist => artist.episodeId === episode.id);
            });
            return [shows, genres, artists];
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

  toggleDescription(): void {
    this.expandedDescription = !this.expandedDescription;
  }

  private formatShow(episodes: Episode[]): { name: string, id: number }[] {
    return episodes.flatMap(episode => 
      episode.shows?.map(show => ({ name: show.name, id: show.id })) || []
    );
  }

  get totalPlays(): number {
    return this.relatedEpisodes.length;
  }

  get firstEpisodeDate(): string | null {
    if (this.relatedEpisodes.length === 0) return null;
    const firstEpisode = this.relatedEpisodes[0];
    return firstEpisode.date;
  }

  get uniqueShowCount(): number {
    const uniqueShows = new Set(this.relatedEpisodes.flatMap(episode => episode.shows?.map(show => show.id) || []));
    return uniqueShows.size;
  }

  get artistStatistics(): string {
    if (!this.relatedEpisodes || this.relatedEpisodes.length === 0) return '';
  
    const artistName = this.artist?.name || 'Artist';
    const playedTimes = this.totalPlays === 1 ? 'once' : `over ${this.totalPlays - 1} times`;
    const firstDate = this.firstEpisodeDate ? `first on ${new Date(this.firstEpisodeDate).toDateString()}` : '';
    const showList = this.formatShow(this.relatedEpisodes).map(show => show.name).join(', ').replace(/, ([^,]*)$/, ', and $1');
    
    let description = `${artistName} has been played ${playedTimes} on KOCMOC.CC, ${firstDate}.`;
    if (this.uniqueShowCount > 1) {
      description += ` ${artistName}'s music has been featured on ${this.uniqueShowCount} shows, including ${showList}.`;
    } else if (this.uniqueShowCount === 1) {
      description += ` ${artistName}'s music has been featured on the show ${showList}.`;
    }
  
    return description;
  }
}