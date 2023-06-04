import { Injectable } from '@angular/core';
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
  public isOnDemandStreamLoaded = false;

  constructor(private cloudStorageService: CloudStorageService) {}

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
    } else if (this.isOnDemandStreamLoaded) {
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
      }, 6000); // delay
    }
  };

  setLiveStream(): void {
    this.stop();
    this.isLiveStreamLoading.next(true);
    this.audio.src = this.liveStreamUrl + '?nocache=' + new Date().getTime();
    this.audio.addEventListener('canplaythrough', this.canPlayThroughListener);
    this.activeStream = 'liveStream';
    this.currentOnDemandStream.next(null);
    this.isOnDemandStreamLoaded = false;
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
    this.isOnDemandStreamLoaded = true;
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
