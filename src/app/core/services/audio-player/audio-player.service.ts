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

  public activeStream: 'none' | 'liveStream' | 'episode' = 'none';
  public isEpisodeLoaded = false;
  public currentEpisode = new BehaviorSubject<Episode | null>(null);
  public currentEpisode$ = this.currentEpisode.asObservable();

  public isLoading = new BehaviorSubject<boolean>(false);
  public isPlaying = new BehaviorSubject<boolean>(false);
  public isPaused = false;

  public liveStreamLoading = new BehaviorSubject<boolean>(false);
  public episodeLoading = new BehaviorSubject<boolean>(false);

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

  removeCanPlayThroughListener(): void {
    this.audio.removeEventListener(
      'canplaythrough',
      this.canPlayThroughListener
    );
  }

  private canPlayThroughListener = () => {
    if (this.activeStream === 'liveStream') {
      setTimeout(() => {
        this.liveStreamLoading.next(false);
        this.play();
      }, 600); // 1 second delay
    } else if (this.activeStream === 'episode') {
      setTimeout(() => {
        this.episodeLoading.next(false);
        this.play();
      }, 600); // 3 seconds delay
    }
  };

  setLiveStream(): void {
    this.stop();
    this.liveStreamLoading.next(true);

    // Reuse the same HTMLAudioElement and just change its `src` property
    this.audio.src = this.liveStreamUrl + '?nocache=' + new Date().getTime();
    this.audio.addEventListener('canplaythrough', this.canPlayThroughListener);

    this.activeStream = 'liveStream';
    this.currentEpisode.next(null); // Reset current episode when playing live stream
    this.isEpisodeLoaded = false;
  }

  setEpisodeStream(episode: Episode): void {
    this.stop();
    this.episodeLoading.next(true);

    const episodeTrackUrl = this.cloudStorageService.getEpisodeTrackUrl(
      episode.acf.track_file_name
    );
    // Reuse the same HTMLAudioElement and just change its `src` property
    this.audio.src = episodeTrackUrl;
    this.audio.addEventListener('canplaythrough', this.canPlayThroughListener);

    this.activeStream = 'episode';
    this.currentEpisode.next(episode);
    this.isEpisodeLoaded = true;
  }

  getCurrentAudio(): HTMLAudioElement {
    return this.audio;
  }

  get isLiveStreamPlaying(): boolean {
    return this.activeStream === 'liveStream' && this.isPlaying.getValue();
  }

  get isEpisodePlaying(): boolean {
    return this.activeStream === 'episode' && this.isPlaying.getValue();
  }
}
