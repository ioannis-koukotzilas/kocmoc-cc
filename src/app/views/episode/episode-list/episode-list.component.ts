import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { Episode } from 'src/app/models/episode';
import { WPService } from 'src/app/core/services/wp/wp.service';
import { Title } from '@angular/platform-browser';
import { Producer } from 'src/app/models/producer';
import { Show } from 'src/app/models/show';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';

@Component({
  selector: 'episode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.css'],
})
export class EpisodeListComponent implements OnInit {

  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  episodes: Episode[] = [];

  loading: boolean = true;

  page: number = 1;
  perPage: number = 18;

  hasMore: boolean = true;
  loadingMore: boolean = false;

  constructor(private wpService: WPService, public audioPlayerService: AudioPlayerService, private titleService: Title) { }

  ngOnInit() {
    this.getEpisodes(this.page, this.perPage);
  }

  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

  getEpisodes(page: number, perPage: number) {
    this.wpService.getEpisodes(page, perPage).pipe(
      switchMap(data => {
        const episodes = data.episodes.map(episode => new Episode(episode));
        this.episodes = [...this.episodes, ...episodes];

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
            return of(null);  // Emit null to let outer stream continue.
          })
        );
      }),
      catchError(error => {
        console.error('WPService observable error while getting the episodes list:', error);
        return of(null); // Emit null to let outer stream continue.
      }),
      takeUntil(this.unsubscribe$)
    ).subscribe({
      next: () => {
        this.loading = false;
        this.loadingMore = false;

        this.titleService.setTitle('Radio Archive - KOCMOC');
      },
      error: (error) => {
        console.error('Main observable error:', error);
      },
      complete: () => {
        console.log('Get episodes completed.');
      }
    });
  }

  loadMore() {
    this.loadingMore = true;
    this.page += 1;
    this.getEpisodes(this.page, this.perPage);
  }
}