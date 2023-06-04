import {
  ChangeDetectionStrategy,
  ChangeDetectorRef,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Subscription } from 'rxjs';
import { AudioPlayerService } from 'src/app/core/services/audio-player/audio-player.service';
import { ScriptLoaderService } from 'src/app/core/services/script-loader.service';

@Component({
  selector: 'app-audio-player',
  templateUrl: './audio-player.component.html',
  styleUrls: ['./audio-player.component.css'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AudioPlayerComponent implements OnInit, OnDestroy {
  private subscriptions: Subscription = new Subscription();

  private _currentAudio: HTMLAudioElement | null = null;

  get currentAudio(): HTMLAudioElement | null {
    return this._currentAudio;
  }

  set currentAudio(value: HTMLAudioElement | null) {
    this._currentAudio = value;
  }

  public currentEpisodeTitle = '';

  constructor(
    public audioPlayerService: AudioPlayerService,
    private cdr: ChangeDetectorRef,
    private scriptLoader: ScriptLoaderService
  ) {}

  ngOnInit(): void {
    this.subscriptions.add(
      this.audioPlayerService.currentOnDemandStream$.subscribe((episode) => {
        if (episode) {
          this.currentEpisodeTitle = episode.title.rendered;
          this.currentAudio = this.audioPlayerService.getCurrentAudio();
        } else {
          this.currentEpisodeTitle = '';
          this.currentAudio = null;
        }
        this.cdr.markForCheck();
      })
    );

    this.subscriptions.add(
      this.audioPlayerService.isPlaying.subscribe(() => {
        this.cdr.markForCheck();
      })
    );

  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  toggleLiveStream(): void {
    this.audioPlayerService.toggleLiveStream();
  }

  toggleOnDemandStream(): void {
    this.audioPlayerService.toggleOnDemandStream();
  }

  backToLiveStream(): void {
    this.audioPlayerService.setLiveStream();
    this.scriptLoader
      .loadScript(
        'https://falcon.shoutca.st/system/streaminfo.js',
        'streaminfo-script'
      )
      .then(() => {
        console.log('Script loaded successfully');
      })
      .catch((err) => {
        console.error('Failed to load script', err);
      });
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

  seekAudio(event: MouseEvent, duration: number): void {
    if (this.currentAudio && duration) {
      const rect = (event.target as HTMLElement).getBoundingClientRect();
      const x = event.clientX - rect.left;
      const clickedPercentage = x / rect.width;
      const clickedTime = clickedPercentage * duration;
      this.currentAudio.currentTime = clickedTime;
    }
  }
}
