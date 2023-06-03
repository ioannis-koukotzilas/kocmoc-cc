import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AudioPlayerService } from 'src/app/core/services/audio-player/audio-player.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  progress = 0;
  currentAudio: HTMLAudioElement | null = null;

  private subscriptions: Subscription = new Subscription();
  public currentEpisodeTitle = '';

  constructor(
    public audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.currentAudio = this.audioPlayerService.getCurrentAudio();
    this.subscriptions.add(
      this.audioPlayerService.currentEpisode$.subscribe(
        (episode) => {
          if (episode) {
            console.log(episode); // Log the episode object here
            this.currentEpisodeTitle = episode.title.rendered;
          } else {
            this.currentEpisodeTitle = '';
          }
          this.currentAudio?.removeEventListener(
            'timeupdate',
            this.updateProgress
          );
          this.currentAudio = this.audioPlayerService.getCurrentAudio();
          this.currentAudio?.addEventListener('timeupdate', () =>
            this.updateProgress()
          );
        }
      )
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    this.currentAudio?.removeEventListener('timeupdate', this.updateProgress);
  }

  toggleLiveStream(): void {
    if (this.audioPlayerService.activeStream === 'liveStream') {
      if (this.audioPlayerService.isPlaying) {
        this.audioPlayerService.pause();
      } else {
        // If it's not playing, set the stream again to bypass the browser cache and then play
        this.audioPlayerService.setLiveStream();
      }
    } else {
      this.audioPlayerService.setLiveStream();
    }
  }

  toggleEpisode(): void {
    if (this.audioPlayerService.activeStream === 'episode' && this.audioPlayerService.isPlaying) {
      this.audioPlayerService.pause();
    } else if (!this.audioPlayerService.isPlaying && this.audioPlayerService.activeStream === 'episode') {
      this.audioPlayerService.play();
    }
  }

  backToLiveStream(): void {
    this.audioPlayerService.setLiveStream();
  }

  playCurrentStream(): void {
    if (!this.audioPlayerService.isPlaying) {
      this.audioPlayerService.play();
    }
  }

  pauseCurrentStream(): void {
    if (this.audioPlayerService.isPlaying) {
      this.audioPlayerService.pause();
    }
  }

  updateProgress(): void {
    if (this.currentAudio && this.currentAudio.currentTime > 0) {
      this.progress =
        (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
      this.cdr.detectChanges();
    }
  }

  seek(event: MouseEvent): void {
    if (this.currentAudio) {
      const progressBar: HTMLElement = event.currentTarget as HTMLElement;
      const { offsetX } = event;
      const newTime =
        (offsetX / progressBar.offsetWidth) * this.currentAudio.duration;
      this.currentAudio.currentTime = newTime;
    }
  }
}