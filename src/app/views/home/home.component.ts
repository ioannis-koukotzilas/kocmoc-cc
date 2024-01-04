import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Episode } from 'src/app/models/episode';
import { HomePage } from 'src/app/models/homePage';
import { register } from 'swiper/element/bundle';
import { AudioPlayerService } from '../audio-player/audio-player.service';
import { Title } from '@angular/platform-browser';

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

  constructor(private wpService: WPService, private audioPlayerService: AudioPlayerService, private titleService: Title) { }

  ngOnInit(): void {
    this.getHomePage();
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  private getHomePage(): void {
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
          this.titleService.setTitle('KOCMOC - Freeform Radio Broadcasting');
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
          this.wpService.getEpisodeProducer(id),
          this.wpService.getEpisodeShow(id),
          this.wpService.getEpisodeGenre(id)
        ]).pipe(
          map(([producers, shows, genres]) => {
            episodes.forEach(episode => {
              episode.producers = producers.filter(producer => producer.episodeId === episode.id),
              episode.shows = shows.filter(show => show.episodeId === episode.id),
              episode.genres = genres.filter(genre => genre.episodeId === episode.id)
            });
            return [producers, shows, genres];
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