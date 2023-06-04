import { Injectable, NgZone } from '@angular/core';
import { BehaviorSubject, Subject } from 'rxjs';
import { Episode } from 'src/app/models/episode';
import { CloudStorageService } from '../cloud-storage/cloud-storage.service';

@Injectable({
  providedIn: 'root',
})
export class AudioPlayerService {
  private audio: HTMLAudioElement = new Audio();
  private liveStreamUrl = 'https://kocmoc1-gecko.radioca.st/stream';

  public activeStream: 'none' | 'liveStream' | 'onDemandStream' = 'none';

  public currentOnDemandStream = new BehaviorSubject<Episode | null>(null);
  public currentOnDemandStream$ = this.currentOnDemandStream.asObservable();

  public isLoading = new BehaviorSubject<boolean>(false);
  public isPlaying = new BehaviorSubject<boolean>(false);
  public isLiveStreamLoading = new BehaviorSubject<boolean>(false);
  public isOnDemandStreamLoading = new BehaviorSubject<boolean>(false);
 // public isOnDemandStreamLoaded = false;
  public isOnDemandStreamLoaded = new BehaviorSubject<boolean>(false);

  // Progress bar
  public currentTimeInSeconds = new BehaviorSubject<number>(0);
  public durationInSeconds = new BehaviorSubject<number>(0);
  public formattedCurrentTime = new BehaviorSubject<string>('00:00');
  public formattedDuration = new BehaviorSubject<string>('00:00');


  constructor(private cloudStorageService: CloudStorageService, private ngZone: NgZone) {
    this.initAudioEvents();
  }

  private initAudioEvents(): void {
    this.audio.onloadedmetadata = () => {
      this.ngZone.run(() => {
        this.durationInSeconds.next(this.audio.duration);
        this.formattedDuration.next(this.formatTime(this.audio.duration));
        this.currentTimeInSeconds.next(this.audio.currentTime);
        this.formattedCurrentTime.next(this.formatTime(this.audio.currentTime));
      });
    };

    this.audio.ontimeupdate = () => {
      this.ngZone.run(() => {
        this.currentTimeInSeconds.next(this.audio.currentTime);
        this.formattedCurrentTime.next(this.formatTime(this.audio.currentTime));
      });
    };
  }

  // private formatTime(time: number): string {
  //   const minutes = Math.floor(time / 60);
  //   const seconds = Math.floor(time % 60);
  //   return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  // }

  private formatTime(time: number): string {
    const hours = Math.round(time / 3600);
  
    if (hours > 0) {
      return `${hours}hr${hours > 1 ? 's' : ''}`;
    }
  
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
  
    return `${minutes}:${seconds < 10 ? '0' + seconds : seconds}`;
  }
  
  

  play(): void {
    this.audio.play();
    this.isPlaying.next(true);
  }

  pause(): void {
    this.audio.pause();
    this.isPlaying.next(false);
  }

  stop(): void {
    this.audio.pause();
    this.audio.currentTime = 0;
    this.isPlaying.next(false);
    this.activeStream = 'none';
    this.removeCanPlayThroughListener();
  }

  toggleLiveStream(): void {
    if (this.activeStream === 'liveStream') {
      this.isPlaying.getValue() ? this.pause() : this.play();
    } else {
      this.setLiveStream();
    }
  }

  toggleOnDemandStream(): void {
    if (this.activeStream === 'onDemandStream') {
      this.isPlaying.getValue() ? this.pause() : this.play();
    } else if (this.isOnDemandStreamLoaded.getValue()) {
      this.play();
    }
  }

  removeCanPlayThroughListener(): void {
    this.audio.removeEventListener(
      'canplaythrough',
      this.canPlayThroughListener
    );
  }

  private canPlayThroughListener = () => {
    if (this.activeStream === 'liveStream') {
      setTimeout(() => {
        this.isLiveStreamLoading.next(false);
        this.play();
      }, 600); // delay
    } else if (this.activeStream === 'onDemandStream') {
      setTimeout(() => {
        this.isOnDemandStreamLoading.next(false);
        this.play();
      }, 600); // delay
    }
  };

  setLiveStream(): void {
    this.stop();
    this.isLiveStreamLoading.next(true);
    this.audio.src = this.liveStreamUrl + '?nocache=' + new Date().getTime();
    this.audio.addEventListener('canplaythrough', this.canPlayThroughListener);
    this.activeStream = 'liveStream';
    this.currentOnDemandStream.next(null);
    this.isOnDemandStreamLoaded.next(false);
  }

  setOnDemandStream(episode: Episode): void {
    this.stop();
    this.isOnDemandStreamLoading.next(true);
    const onDemandStreamkUrl = this.cloudStorageService.getOnDemandStreamUrl(
      episode.acf.track_file_name
    );
    this.audio.src = onDemandStreamkUrl;
    this.audio.addEventListener('canplaythrough', this.canPlayThroughListener);
    this.activeStream = 'onDemandStream';
    this.currentOnDemandStream.next(episode);
    this.isOnDemandStreamLoaded.next(true);
  }

  getCurrentAudio(): HTMLAudioElement {
    return this.audio;
  }

  get isLiveStreamPlaying(): boolean {
    return this.activeStream === 'liveStream' && this.isPlaying.getValue();
  }

  get isOnDemandStreamPlaying(): boolean {
    return this.activeStream === 'onDemandStream' && this.isPlaying.getValue();
  }
}
