import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, switchMap, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { Genre } from 'src/app/models/genre';

@Component({
  selector: 'app-episode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.css'],
})
export class EpisodeListComponent implements OnInit {

  episodes: Episode[] = [];
  genres: { [id: string]: Genre } = {};
  isLoading = true;

  public currentOnDemandStream$: Observable<Episode | null>;
  public onDemandStreamLoading$: Observable<boolean>;
  public onDemandStreamPlaying$: Observable<boolean>;

  constructor(private wordPressService: WordPressService, public audioPlayerService: AudioPlayerService) {
        this.currentOnDemandStream$ = this.audioPlayerService.currentOnDemandStream$;
        this.onDemandStreamLoading$ = this.audioPlayerService.onDemandStreamLoading$;
        this.onDemandStreamPlaying$ = this.audioPlayerService.onDemandStreamPlaying$;
  }

  ngOnInit(): void {
    this.isLoading = true;

    this.wordPressService
      .fetchEpisodes()
      .pipe(
        tap((episodesData) => {
          this.episodes = episodesData;
        }),
        switchMap(() => this.fetchGenresForEpisodes()),
        catchError((error) => {
          console.error('There was an error: ', error);
          this.isLoading = false;
          throw error;
        })
      )
      .subscribe((genresData) => {
        genresData.forEach((genre) => {
          this.genres[genre.id] = genre;
        });
        this.isLoading = false;
      });
  }

  hasThumbnail(episode: any): boolean {
    return (
      episode._embedded &&
      episode._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium
    );
  }

  getThumbnailUrl(episode: any): string {
    return episode._embedded['wp:featuredmedia'][0].media_details.sizes.medium
      .source_url;
  }

  private fetchGenresForEpisodes(): Observable<Genre[]> {
    const genreIds = new Set<string>();
    this.episodes.forEach((episode) => {
      episode.genre.forEach((genreId: string) => {
        genreIds.add(genreId);
      });
    });

    const genreObservables = Array.from(genreIds).map((id) =>
      this.wordPressService.fetchGenre(id)
    );
    return forkJoin(genreObservables);
  }

  getGenresForEpisode(episode: Episode): Genre[] {
    return episode.genre.map((genreId: string) => this.genres[genreId]);
  }

  playEpisode(episode: Episode) {
    if (this.audioPlayerService.currentOnDemandStream.value?.id === episode.id) {
      // If this is the currently loaded episode, just pause/resume it
      this.audioPlayerService.toggleOnDemandStream(episode);
    } else {
      // If this is a new episode, load and start it
      this.audioPlayerService.playOnDemandStream(episode);
    }
  }
  
}
