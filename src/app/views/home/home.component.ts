import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Episode } from 'src/app/models/episode';
import { HomePage } from 'src/app/models/homePage';
import { register } from 'swiper/element/bundle';
import { AudioPlayerService } from '../audio-player/audio-player.service';

register();

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  homePage: HomePage | null = null;

  loading: boolean = true;

  recentEpisodes: Episode[] = [];
  episodesPage: number = 1;
  episodesPerPage: number = 10;

  constructor(private wpService: WPService, private audioPlayerService: AudioPlayerService) { }

  ngOnInit(): void {
    this.getHomePage();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getHomePage() {
    const id = 35;
    this.loading = true;

    this.wpService.getHomePage(id).pipe(
      catchError(error => {
        console.error('Error getting home page:', error);
        return of(null);
      }),
      tap(page => {
        if (page) {
          this.homePage = new HomePage(page);
        }
      }),
      takeUntil(this.unsubscribe$),
    ).subscribe({
      next: () => {
        this.getRecentEpisodes(this.episodesPage, this.episodesPerPage, () => {
          this.loading = false;
        });
      },
      error: (error) => {
        console.error('Main observable error:', error);
        this.loading = false;
      }
    });
  }

  getRecentEpisodes(page: number, perPage: number, operationCompleted: () => void): void {
    this.wpService.getEpisodes(page, perPage).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));
        this.recentEpisodes = [...this.recentEpisodes, ...episodes];
        const id = episodes.map(episode => episode.id);
        return forkJoin([
          this.wpService.getEpisodeGenre(id),
        ]).pipe(
          map(([genres]) => {
            episodes.forEach(episode => {
              episode.genres = genres.filter(genre => genre.episodeId === episode.id)
            });
            return [genres];
          }),
          catchError(error => {
            console.error('ForkJoin observable error while getting details):', error);
            return of(null);
          })
        );
      }),
      catchError(error => {
        console.error('WPService observable error while getting the episodes:', error);
        return of(null);
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        operationCompleted();
      },
      error: (error) => {
        console.error('Main observable error:', error);
        operationCompleted();
      }
    });
  }
}


// default pages

// getPage() {
//   this.route.paramMap.pipe(
//     switchMap(params => {
//       const id = Number(params.get('id') || '0');
//       this.loading = true;
//       return this.wpService.getPage(id).pipe(
//         catchError(error => {
//           console.error('Error getting home page:', error);
//           return of(null);
//         })
//       );
//     }),
//     tap(page => {
//       if (page) this.homePage = new HomePage(page);
//     }),
//     takeUntil(this.unsubscribe$),
//   ).subscribe({
//     next: () => {
//       this.loading = false;
//     },
//     error: (error) => {
//       console.error('Main observable error:', error);
//     },
//     complete: () => {
//       console.log('Unsubscription completed.');
//     }
//   });
// }