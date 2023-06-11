import { Component, OnInit } from '@angular/core';
import { Observable, Subject, catchError, forkJoin, of, switchMap, takeUntil, tap } from 'rxjs';
import { AudioPlayerService } from 'src/app/views/audio-player/audio-player.service';
import { WordPressService } from 'src/app/core/services/wordpress/wordpress.service';
import { Episode } from 'src/app/models/episode';
import { Artist } from 'src/app/models/artist';
import { Genre } from 'src/app/models/genre';

@Component({
  selector: 'app-episode-list',
  templateUrl: './episode-list.component.html',
  styleUrls: ['./episode-list.component.css'],
})
export class EpisodeListComponent implements OnInit {

  episodes: Episode[] = [];
  artists: Artist[] = [];
  genres: Genre[] = [];

  isLoadingEpisodes: boolean = true;
  isLoadingArtists: boolean = true;
  isLoadingGenres: boolean = true;

  private unsubscribe$ = new Subject<void>();

  public currentOnDemandStream$: Observable<Episode | null> = this.audioPlayerService.currentOnDemandStream$;
  public onDemandStreamLoading$: Observable<boolean> = this.audioPlayerService.onDemandStreamLoading$;
  public onDemandStreamPlaying$: Observable<boolean> = this.audioPlayerService.onDemandStreamPlaying$;

  constructor(private wordPressService: WordPressService, public audioPlayerService: AudioPlayerService) { }

  ngOnInit(): void {
    this.getEpisodes();
    this.getArtists();
    this.getGenres();
  }

  getEpisodes(): void {
    setTimeout(() => {
      this.wordPressService.getEpisodes()
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe(episodes => {
              this.episodes = episodes;
              this.isLoadingEpisodes = false;
          });
  }, 1000); // Add 2 seconds delay
  }

  getArtists(): void {
    this.wordPressService.getArtists()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(artists => {
        this.artists = artists;
        this.isLoadingArtists = false;
      });
  }

  getGenres(): void {
    this.wordPressService.getGenres()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe(genres => {
        this.genres = genres;
        this.isLoadingGenres = false;
      });
  }

  getEpisodeArtist(artistId: number): Artist | null {
    return this.artists.find(artist => artist.id === artistId) || null;
  }

  getEpisodeGenre(genreId: number): Genre | null {
    return this.genres.find(genre => genre.id === genreId) || null;
  }

  playEpisode(episode: Episode) {
    // If the live stream is playing, stop it
    if (this.audioPlayerService.liveStreamPlaying.value) {
      this.audioPlayerService.stopLiveStream();
    }
    // Toggle or play the on-demand stream
    if (this.audioPlayerService.currentOnDemandStream.value?.id === episode.id) {
      this.audioPlayerService.toggleOnDemandStream(episode);
    } else {
      this.audioPlayerService.playOnDemandStream(episode);
    }
  }

  ngOnDestroy(): void {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }
}
