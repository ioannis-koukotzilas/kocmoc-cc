import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { Observable, Subject, catchError, concatMap, forkJoin, map, of, switchMap, takeUntil, tap } from "rxjs";
import { WPService } from "src/app/core/services/wp/wp.service";

import { Artist } from "src/app/models/artist";
import { Episode } from "src/app/models/episode";
import { AudioPlayerService } from "../../audio-player/audio-player.service";
import { LastFmService } from "src/app/core/services/last-fm.service";
import { LastFmArtist } from "src/app/models/lastFmArtist";

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
  truncatedDescription: string = '';

  constructor(private route: ActivatedRoute, private audioPlayerService: AudioPlayerService, private wpService: WPService, private lastFmService: LastFmService) { }

  ngOnInit(): void {
    this.getArtist();
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getArtist() {
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
          return this.lastFmService.getArtistMetadata(this.artist.name).pipe(
            map((data) => {
              this.lastFmArtist = new LastFmArtist(data);
              return this.lastFmArtist;
            }),
            catchError(error => {
              console.log('Error getting artist metadata from Last.fm:', error);
              return of(artist);  // If there's an error, continue with the original artist
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
          this.loading = false;
          this.getRelatedArtistEpisodes(this.page, this.perPage, this.artist?.id || 0);
        }
      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Episode detail component unsubscription completed.');
      }
    });
  }
  



  getRelatedArtistEpisodes(page: number, perPage: number, id: number) {
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

  

    toggleDescription() {
      this.expandedDescription = !this.expandedDescription;
  }

}




  // getArtist() {
  //   this.route.paramMap.pipe(
  //     switchMap(params => {
  //       const id = Number(params.get('id') || '0');
  //       this.loading = true;
  //       return this.wpService.getArtist(id).pipe(
  //         catchError(error => {
  //           console.error('Error getting artist from WPService:', error);
  //           return of(null);  // Continue the stream by emitting null.
  //         })
  //       );
  //     }),
  //     tap(artist => {
  //       if (artist) this.artist = new Artist(artist);
  //     }),
  //     takeUntil(this.unsubscribe$),
  //   ).subscribe({
  //     next: () => {
  //       this.loading = false;
  //       this.getRelatedArtistEpisodes(this.page, this.perPage, this.artist?.id || 0);
  //     },
  //     error: (error) => {
  //       console.error('Main observable error while processing episode:', error);
  //     },
  //     complete: () => {
  //       console.log('Episode detail component unsubscription completed.');
  //     }
  //   });
  // }