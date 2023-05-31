import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, catchError } from "rxjs";
import { AudioPlayerService } from "src/app/core/services/audio-player/audio-player.service";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AudioPlayerComponent implements OnInit, OnDestroy {
  progress = 0;
  currentAudio: HTMLAudioElement | null = null;

  private currentAudioSub: Subscription = new Subscription();

  constructor(public audioPlayerService: AudioPlayerService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.currentAudio = this.audioPlayerService.getCurrentAudio();
    this.currentAudioSub = this.audioPlayerService.currentSource$.subscribe(source => {
      this.currentAudio?.removeEventListener('timeupdate', this.updateProgress);
      this.currentAudio = this.audioPlayerService.getCurrentAudio();
      this.currentAudio?.addEventListener('timeupdate', () => this.updateProgress());
    });
  }

  ngOnDestroy(): void {
    this.currentAudio?.removeEventListener('timeupdate', this.updateProgress);
    this.currentAudioSub.unsubscribe();
  }

  playLiveStream(): void {
    this.audioPlayerService.stop();
    this.audioPlayerService.setLiveStream();
    this.audioPlayerService.play();
  }

  toggleLiveStream(): void {
    if (this.audioPlayerService.isPlayingLiveStream) {
        this.audioPlayerService.pause();
    } else {
        this.playLiveStream();
    }
  }

  updateProgress(): void {
    if (this.currentAudio && this.currentAudio.currentTime > 0) {
      this.progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
      this.cdr.detectChanges();
    }
  }

  seek(event: MouseEvent): void {
    if (this.currentAudio) {
      const progressBar: HTMLElement = event.currentTarget as HTMLElement;
      const { offsetX } = event;
      const newTime = (offsetX / progressBar.offsetWidth) * this.currentAudio.duration;
      this.currentAudio.currentTime = newTime;
    }
  }

  play(): void {
    this.audioPlayerService.play();
  }

  pause(): void {
    this.audioPlayerService.pause();
  }
}