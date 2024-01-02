import { Injectable } from '@angular/core';
import { BehaviorSubject, Subject, Subscription, catchError, map, of, switchMap, takeUntil, tap } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { CloudStorageService } from '../../core/services/cloud-storage/cloud-storage.service';
import { WPService } from 'src/app/core/services/wp/wp.service';

const STREAM_TYPE_LIVE = 'liveStream';
const STREAM_TYPE_ON_DEMAND = 'onDemandStream';
const LOAD_DELAY_MS = 300;

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
  private readonly MAX_RANDOM_PLAYS = 6;
  private playedEpisodes: number[] = [];

  private mirrorLiveStreamUrls = [
    { url: 'https://wkcr.streamguys1.com/live', start: '16:00', end: '17:00', name: 'WKCR' },
    { url: 'https://stream.resonance.fm/resonance-extra', start: '18:00', end: '19:51', name: 'Resonance Extra' },
  ];
  
  private defaultLiveStreamUrl = 'https://kocmoc1-gecko.radioca.st/stream';

  constructor(private cloudStorageService: CloudStorageService, private wpService: WPService) {
    this.liveStreamAudio.preload = 'auto';
    this.onDemandStreamAudio.preload = 'auto';

    this.onDemandStreamAudio.addEventListener('ended', () => {
      if (this.randomPlayCount < this.MAX_RANDOM_PLAYS) {
        this.onDemandStreamPlayRandomTrackFromTheSameGenre();
      } else {
        this.randomPlayCount = 0;
        this.liveStreamPlay();
      }
    });
  }

  getCurrentLiveStreamUrl(): string {
    const currentLiveStreamUrl = new URL(this.liveStreamAudio.src);
    return currentLiveStreamUrl.origin + currentLiveStreamUrl.pathname;
  }
  
  getDefaultLiveStreamUrl(): string {
    return this.defaultLiveStreamUrl;
  }

  findStreamNameByUrl(url: string): string {
    const stream = this.mirrorLiveStreamUrls.find(stream => url.includes(stream.url));
    return stream ? stream.name : 'Unknown';
  }

  initializeLiveStream() {
    const now = new Date();
    const currentTimeUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()));

    let selectedStreamUrl = this.defaultLiveStreamUrl;

    for (const stream of this.mirrorLiveStreamUrls) {
      const [startHour, startMin] = stream.start.split(':').map(Number);
      const [endHour, endMin] = stream.end.split(':').map(Number);
      const startTime = new Date(Date.UTC(currentTimeUtc.getUTCFullYear(), currentTimeUtc.getUTCMonth(), currentTimeUtc.getUTCDate(), startHour, startMin));
      const endTime = new Date(Date.UTC(currentTimeUtc.getUTCFullYear(), currentTimeUtc.getUTCMonth(), currentTimeUtc.getUTCDate(), endHour, endMin));

      if (currentTimeUtc >= startTime && currentTimeUtc < endTime) {
        selectedStreamUrl = stream.url;
        break;
      }
    }

    this.liveStreamAudio.src = selectedStreamUrl + '?nocache=' + new Date().getTime();
  }

  liveStreamPlay() {
    if (this.onDemandStreamPlaying.value) {
      this.onDemandStreamStop();
    }
    this.streamTypeSelected.next(STREAM_TYPE_LIVE);
    this.liveStreamSet(false);
    this.liveStreamAudio.addEventListener('canplay', this.liveStreamCanPlayListener);
    this.liveStreamAudio.addEventListener('playing', this.liveStreamPlayingListener);
  }

  liveStreamSet(checkUrlChange: boolean) {
    const now = new Date();
    const currentTimeUtc = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate(), now.getUTCHours(), now.getUTCMinutes()));
  
    let selectedStreamUrl = this.defaultLiveStreamUrl;
  
    for (const stream of this.mirrorLiveStreamUrls) {
      const [startHour, startMin] = stream.start.split(':').map(Number);
      const [endHour, endMin] = stream.end.split(':').map(Number);
      const startTime = new Date(Date.UTC(currentTimeUtc.getUTCFullYear(), currentTimeUtc.getUTCMonth(), currentTimeUtc.getUTCDate(), startHour, startMin));
      const endTime = new Date(Date.UTC(currentTimeUtc.getUTCFullYear(), currentTimeUtc.getUTCMonth(), currentTimeUtc.getUTCDate(), endHour, endMin));
  
      if (currentTimeUtc >= startTime && currentTimeUtc < endTime) {
        selectedStreamUrl = stream.url;
        break;
      }
    }
  
    if (checkUrlChange) {
      const currentSrcBaseUrl = this.getBaseUrl(this.liveStreamAudio.src);
      const selectedStreamBaseUrl = this.getBaseUrl(selectedStreamUrl);
  
      if (currentSrcBaseUrl !== selectedStreamBaseUrl) {
        this.liveStreamLoading.next(true);
        this.liveStreamPlaying.next(false);
        this.liveStreamAudio.src = selectedStreamUrl + '?nocache=' + new Date().getTime();
      }
    } else {
      this.liveStreamLoading.next(true);
      this.liveStreamPlaying.next(false);
      this.liveStreamAudio.src = selectedStreamUrl + '?nocache=' + new Date().getTime();
    }
  }  

  getBaseUrl(url: string): string {
    const parsedUrl = new URL(url);
    return parsedUrl.origin + parsedUrl.pathname;
  }

  liveStreamPause() {
    this.liveStreamAudio.pause();
    this.liveStreamPlaying.next(false);
  }

  liveStreamStop() {
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

  liveStreamTogglePlay() {
    this.liveStreamPlaying.value ? this.liveStreamPause() : this.liveStreamPlay();
  }

  onDemandStreamPlay(episode: Episode) {
    if (this.liveStreamPlaying.value) {
      this.liveStreamStop();
    }
    this.streamTypeSelected.next(STREAM_TYPE_ON_DEMAND);
    this.onDemandStreamSet(episode);
    this.onDemandStreamAudio.addEventListener('canplay', this.onDemandStreamCanPlayListener);
    this.onDemandStreamAudio.addEventListener('playing', this.onDemandStreamPlayingListener);
  }

  onDemandStreamSet(episode: Episode) {
    this.onDemandStreamLoading.next(true);
    this.onDemandStreamPlaying.next(false);
    this.onDemandStreamAudio.src = this.cloudStorageService.getOnDemandStreamUrl(episode.track);
    this.currentOnDemandStream.next(episode);

    this.onDemandStreamAudio.addEventListener('timeupdate', () => {
      this.onDemandStreamCurrentTime.next(this.onDemandStreamAudio.currentTime);
    });
    this.onDemandStreamAudio.addEventListener('durationchange', () => {
      this.onDemandStreamDuration.next(this.onDemandStreamAudio.duration);
    });
  }

  onDemandStreamPause() {
    this.onDemandStreamAudio.pause();
    this.onDemandStreamPlaying.next(false);
    this.onDemandStreamAudio.removeEventListener('canplay', this.onDemandStreamCanPlayListener);
    this.onDemandStreamAudio.removeEventListener('playing', this.onDemandStreamPlayingListener);
  }

  onDemandStreamResume() {
    if (this.onDemandStreamAudio.paused && !this.onDemandStreamAudio.ended) {
      this.onDemandStreamAudio.play();
      this.onDemandStreamPlaying.next(true);
    }
  }

  onDemandStreamStop() {
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

  onDemandStreamTogglePlay(episode: Episode) {
    this.streamTypeSelected.next(STREAM_TYPE_ON_DEMAND);
    if (this.onDemandStreamPlaying.value) {
      this.onDemandStreamPause();
    } else if (this.currentOnDemandStream.value?.id === episode.id) {
      this.onDemandStreamResume();
    } else {
      this.onDemandStreamPlay(episode);
    }
  }

  onDemandStreamUpdateFromScrub(time: number) {
    const streamPlaying = !this.onDemandStreamAudio.paused;

    this.onDemandStreamAudio.currentTime = time;
    this.onDemandStreamCurrentTime.next(time);

    if (streamPlaying) {
      this.onDemandStreamLoading.next(true);
      const resumePlayback = () => {
        this.onDemandStreamAudio.play();
        this.onDemandStreamLoading.next(false);
        this.onDemandStreamAudio.removeEventListener('canplaythrough', resumePlayback);
      };
      this.onDemandStreamAudio.addEventListener('canplaythrough', resumePlayback);
    }
  }

  private onDemandStreamPlayRandomTrackFromTheSameGenre = () => {
    const currentEpisodeId = this.currentOnDemandStream.value?.id;
    const currentGenreIds = this.currentOnDemandStream.value?.genre;

    if (!currentGenreIds || !currentGenreIds.length) {
      this.randomPlayCount = 0;
      this.playedEpisodes = [];
      this.liveStreamPlay();
      return;
    }

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
          this.playedEpisodes.push(randomEpisode.id);
          this.randomPlayCount++;
          this.onDemandStreamPlay(randomEpisode);
        } else {
          this.randomPlayCount = 0;
          this.playedEpisodes = [];
          this.liveStreamPlay();
        }
      });
  };
}