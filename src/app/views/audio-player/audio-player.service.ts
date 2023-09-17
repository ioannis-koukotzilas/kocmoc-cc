import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, catchError, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { CloudStorageService } from '../../core/services/cloud-storage/cloud-storage.service';
import { WPService } from 'src/app/core/services/wp/wp.service';

const STREAM_TYPE_LIVE = 'liveStream';
const STREAM_TYPE_ON_DEMAND = 'onDemandStream';
const LOAD_DELAY_MS = 400;

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {

  private readonly onDestroy = new Subject<void>();

  private liveStreamAudio: HTMLAudioElement = new Audio();
  private onDemandStreamAudio: HTMLAudioElement = new Audio();

  public liveStreamLoading = new BehaviorSubject<boolean>(false);
  public liveStreamPlaying = new BehaviorSubject<boolean>(false);
  public onDemandStreamLoading = new BehaviorSubject<boolean>(false);
  public onDemandStreamPlaying = new BehaviorSubject<boolean>(false);
  public streamTypeSelected = new BehaviorSubject<'liveStream' | 'onDemandStream'>(STREAM_TYPE_LIVE);
  public currentOnDemandStream = new BehaviorSubject<Episode | null>(null);

  public liveStreamLoading$ = this.liveStreamLoading.asObservable();
  public liveStreamPlaying$ = this.liveStreamPlaying.asObservable();
  public onDemandStreamLoading$ = this.onDemandStreamLoading.asObservable();
  public onDemandStreamPlaying$ = this.onDemandStreamPlaying.asObservable();
  public streamTypeSelected$ = this.streamTypeSelected.asObservable();
  public currentOnDemandStream$ = this.currentOnDemandStream.asObservable();

  // Progress bar
  public onDemandStreamCurrentTime = new BehaviorSubject<number>(0);
  public onDemandStreamDuration = new BehaviorSubject<number>(0);

  // Random Play
  private randomPlayCount: number = 0;
  private readonly MAX_RANDOM_PLAYS = 1;
  private playedEpisodes: number[] = [];

  constructor(private cloudStorageService: CloudStorageService, private wpService: WPService) {
    this.liveStreamAudio.preload = 'auto';
    this.onDemandStreamAudio.preload = 'auto';

    this.onDemandStreamAudio.addEventListener('ended', () => {
      if (this.randomPlayCount < this.MAX_RANDOM_PLAYS) {
        this.playRandomTrackFromSameGenre();
      } else {
        this.randomPlayCount = 0; // Reset the play count
        this.playLiveStream();  // Play the live stream
      }
    });
  }

  playLiveStream(): void {
    if (this.onDemandStreamPlaying.value) {
      this.stopOnDemandStream();
    }
    this.streamTypeSelected.next(STREAM_TYPE_LIVE);
    this.setLiveStream();
    this.liveStreamAudio.addEventListener('canplay', this.liveStreamCanPlayListener);
    this.liveStreamAudio.addEventListener('playing', this.liveStreamPlayingListener);
  }

  setLiveStream(): void {
    this.liveStreamLoading.next(true);
    this.liveStreamPlaying.next(false);
    this.liveStreamAudio.src = 'https://kocmoc1-gecko.radioca.st/stream' + '?nocache=' + new Date().getTime();
  }

  pauseLiveStream(): void {
    this.liveStreamAudio.pause();
    this.liveStreamPlaying.next(false);
  }

  stopLiveStream(): void {
    this.liveStreamAudio.pause();
    this.liveStreamAudio.currentTime = 0;
    this.liveStreamPlaying.next(false);
    this.liveStreamLoading.next(false);
    this.liveStreamAudio.removeEventListener('canplay', this.liveStreamCanPlayListener);
    this.liveStreamAudio.removeEventListener('playing', this.liveStreamPlayingListener);
  }

  private liveStreamCanPlayListener = () => {
    setTimeout(() => {
      if (this.liveStreamLoading.value && !this.liveStreamAudio.error) {
        this.liveStreamLoading.next(false);
        this.liveStreamAudio.play();
      }
    }, LOAD_DELAY_MS);
  };

  private liveStreamPlayingListener = () => {
    if (!this.liveStreamPlaying.value && !this.liveStreamLoading.value && !this.liveStreamAudio.error) {
      this.liveStreamPlaying.next(true);
    }
  };

  toggleLiveStream(): void {
    this.liveStreamPlaying.value ? this.pauseLiveStream() : this.playLiveStream();
  }

  playOnDemandStream(episode: Episode): void {
    if (this.liveStreamPlaying.value) {
      this.stopLiveStream();
    }
    this.streamTypeSelected.next(STREAM_TYPE_ON_DEMAND);
    this.setOnDemandStream(episode);
    this.onDemandStreamAudio.addEventListener('canplay', this.onDemandStreamCanPlayListener);
    this.onDemandStreamAudio.addEventListener('playing', this.onDemandStreamPlayingListener);
  }

  setOnDemandStream(episode: Episode): void {
    this.onDemandStreamLoading.next(true);
    this.onDemandStreamPlaying.next(false);
    this.onDemandStreamAudio.src = this.cloudStorageService.getOnDemandStreamUrl(episode.track);
    this.currentOnDemandStream.next(episode);

    // Add these lines
    this.onDemandStreamAudio.addEventListener('timeupdate', () => {
      this.onDemandStreamCurrentTime.next(this.onDemandStreamAudio.currentTime);
    });
    this.onDemandStreamAudio.addEventListener('durationchange', () => {
      this.onDemandStreamDuration.next(this.onDemandStreamAudio.duration);
    });
  }

  pauseOnDemandStream(): void {
    this.onDemandStreamAudio.pause();
    this.onDemandStreamPlaying.next(false);
    this.onDemandStreamAudio.removeEventListener('canplay', this.onDemandStreamCanPlayListener);
    this.onDemandStreamAudio.removeEventListener('playing', this.onDemandStreamPlayingListener);
  }

  resumeOnDemandStream(): void {
    if (this.onDemandStreamAudio.paused && !this.onDemandStreamAudio.ended) {
      this.onDemandStreamAudio.play();
      this.onDemandStreamPlaying.next(true);
    }
  }

  stopOnDemandStream(): void {
    this.onDemandStreamAudio.pause();
    this.onDemandStreamAudio.currentTime = 0;
    this.onDemandStreamPlaying.next(false);
    this.onDemandStreamLoading.next(false);
    this.currentOnDemandStream.next(null);
    this.onDemandStreamAudio.removeEventListener('canplay', this.onDemandStreamCanPlayListener);
    this.onDemandStreamAudio.removeEventListener('playing', this.onDemandStreamPlayingListener);
  }

  private onDemandStreamCanPlayListener = () => {
    setTimeout(() => {
      if (this.onDemandStreamLoading.value && !this.onDemandStreamAudio.error) {
        this.onDemandStreamLoading.next(false);
        this.onDemandStreamAudio.play();
      }
    }, LOAD_DELAY_MS);

    // Listeners for time update and duration change
    const stopListening = new Subject<void>();
    this.onDemandStreamAudio.addEventListener('timeupdate', () => {
      this.onDemandStreamCurrentTime.next(this.onDemandStreamAudio.currentTime);
    });
    this.onDemandStreamAudio.addEventListener('durationchange', () => {
      this.onDemandStreamDuration.next(this.onDemandStreamAudio.duration);
    });
    this.onDemandStreamPlaying.pipe(takeUntil(stopListening)).subscribe((isPlaying) => {
      if (!isPlaying) {
        stopListening.next();
      }
    });
  };

  private onDemandStreamPlayingListener = () => {
    if (!this.onDemandStreamPlaying.value && !this.onDemandStreamLoading.value && !this.onDemandStreamAudio.error) {
      this.onDemandStreamPlaying.next(true);
    }
  };

  toggleOnDemandStream(episode: Episode): void {
    this.streamTypeSelected.next(STREAM_TYPE_ON_DEMAND);
    if (this.onDemandStreamPlaying.value) {
      this.pauseOnDemandStream();
    } else if (this.currentOnDemandStream.value?.id === episode.id) {
      this.resumeOnDemandStream();
    } else {
      this.playOnDemandStream(episode);
    }
  }

  // Progress b

  setOnDemandStreamCurrentTime(time: number): void {
    this.onDemandStreamAudio.currentTime = time;
  }

  updateCurrentTime(time: number): void {
    this.onDemandStreamCurrentTime.next(time);
  }

  private playRandomTrackFromSameGenre = (): void => {
    const currentEpisodeId = this.currentOnDemandStream.value?.id;
    const currentGenreIds = this.currentOnDemandStream.value?.genre;

    if (!currentGenreIds || !currentGenreIds.length) return;

    this.wpService.getActiveGenres(1, 100)
      .pipe(
        map(response => response.filter(genre => currentGenreIds.includes(genre.id))),
        switchMap(activeGenres => {
          if (activeGenres && activeGenres.length) {
            return this.wpService.getEpisodes(1, 100).pipe(
              map(response => response.episodes.map(episodeData => new Episode(episodeData)))
            );
          } else {
            return of([]);
          }
        }),
        map(episodes => episodes.filter(episode =>
          episode.id !== currentEpisodeId && 
          !this.playedEpisodes.includes(episode.id) &&  // Exclude already played episodes
          episode.genre && episode.genre.some(genreId => currentGenreIds.includes(genreId))
        )),
        catchError(error => {
          console.error('Error occurred:', error);
          return of([]);
        }),
        takeUntil(this.onDestroy)
      )
      .subscribe(matchingEpisodes => {
        if (matchingEpisodes && matchingEpisodes.length) {
          const randomEpisode = matchingEpisodes[Math.floor(Math.random() * matchingEpisodes.length)];
          console.log('Randomly Selected Episode:', randomEpisode);
          this.playedEpisodes.push(randomEpisode.id);  // Add the episode to the played list
          this.randomPlayCount++;
          this.playOnDemandStream(randomEpisode);
        } else {
          this.randomPlayCount = 0;
          this.playedEpisodes = [];  // Reset the list if no more matching episodes are available
        }
      });
  };

  cleanup() {
    this.onDestroy.next();
    this.onDestroy.complete();
  }

}