import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit } from "@angular/core";
import { Subscription, catchError } from "rxjs";
import { AudioPlayerService } from "src/app/core/services/audio-player/audio-player.service";

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush
})

export class AudioPlayerComponent implements OnInit {
  progress = 0;
  audio$ = this.audioPlayerService.audio$.pipe(
    catchError(err => {
      console.error(err);
      return [];
    })
  );
  currentAudio: HTMLAudioElement | null = null;

  constructor(private audioPlayerService: AudioPlayerService, private cdr: ChangeDetectorRef) { }

  ngOnInit(): void {
    this.audio$.subscribe((audio: HTMLAudioElement | null) => {
      if (audio) {
        audio.ontimeupdate = () => this.updateProgress(audio);
        this.currentAudio = audio;
      }
    });
  }

  updateProgress(audio: HTMLAudioElement): void {
    if (audio.currentTime > 0) {
      this.progress = (audio.currentTime / audio.duration) * 100;
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
