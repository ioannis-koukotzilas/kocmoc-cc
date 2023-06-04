import { Component, OnInit } from '@angular/core';
import { Observable, catchError, forkJoin, switchMap, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/core/services/audio-player/audio-player.service';
import { CloudStorageService } from 'src/app/core/services/cloud-storage/cloud-storage.service';
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

  constructor(
    private wordPressService: WordPressService,
    private cloudStorageService: CloudStorageService,
    public audioPlayerService: AudioPlayerService
  ) {}

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

  // Check if an episode has a thumbnail
  hasThumbnail(episode: any): boolean {
    return (
      episode._embedded &&
      episode._embedded['wp:featuredmedia']?.[0]?.media_details?.sizes?.medium
    );
  }

  // Get the thumbnail URL of an episode
  getThumbnailUrl(episode: any): string {
    return episode._embedded['wp:featuredmedia'][0].media_details.sizes.medium
      .source_url;
  }

  // Fetch genres for all episodes
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

  // Get the genres for a particular episode
  getGenresForEpisode(episode: Episode): Genre[] {
    return episode.genre.map((genreId: string) => this.genres[genreId]);
  }

  playEpisode(episode: Episode) {
    if (this.audioPlayerService.currentOnDemandStream.value?.id === episode.id) {
      // If this is the currently loaded episode, just pause/resume it
      if (this.audioPlayerService.isOnDemandStreamPlaying) {
        this.audioPlayerService.pause();
      } else {
        this.audioPlayerService.play();
      }
    } else {
      // If this is a new episode, load and start it
      this.audioPlayerService.setOnDemandStream(episode);
    }
  }
  
  

}
